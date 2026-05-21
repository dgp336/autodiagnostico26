import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeguimientoChatComponent } from '../../components/seguimiento/chat/chat';
import { AuthStateService } from '../../services/auth-state.service';
import { MechanicClient, MechanicService } from '../../services/mechanic.service';

type ClientStatus = 'verde' | 'amarillo' | 'naranja' | 'rojo';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, SeguimientoChatComponent],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent {
  private mechanicService = inject(MechanicService);
  private auth = inject(AuthStateService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  message = '';
  updates: string[] = [];
  tracking: MechanicClient | null = null;
  loading = true;

  clientId = 0;

  constructor() {
    const param = this.route.snapshot.queryParamMap.get('clientId') ?? this.route.snapshot.queryParamMap.get('clientid') ?? this.route.snapshot.queryParamMap.get('client');
    const parsed = Number(param);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.clientId = parsed;
    }

    this.loadTracking();
  }

  get isMechanic(): boolean {
    const role = this.auth.role();
    return role === 'TALLER' || role === 'ADMIN';
  }

  get status(): ClientStatus {
    return (this.tracking?.status ?? 'amarillo') as ClientStatus;
  }

  setStatus(status: ClientStatus): void {
    const mechanicId = this.auth.userId();
    if (!mechanicId) {
      return;
    }

    this.mechanicService.updateClientStatus(mechanicId, this.clientId, status).subscribe({
      next: () => {
        if (this.tracking) {
          this.tracking.status = status;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
      }
    });
  }

  addMessage(): void {
    const trimmed = this.message.trim();
    if (!trimmed) {
      return;
    }

    const mechanicId = this.auth.userId();
    if (!mechanicId) {
      return;
    }

    this.mechanicService.updateTrackingMessage(mechanicId, this.clientId, trimmed).subscribe({
      next: () => {
        this.updates = [trimmed, ...this.updates].slice(0, 8);
        if (this.tracking) {
          this.tracking.latestUpdate = trimmed;
        }
        this.message = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error guardando actualización:', err);
      }
    });
  }
    ngOnInit(): void {

      this.route.queryParamMap.subscribe(params => {

        const clientId = Number(params.get('clientId'));

        if (!clientId) {
          return;
        }

        this.clientId = clientId;

        this.loadTracking();
      });
    }
  get chatParticipantId(): number {
    return this.clientId;
  }

  get chatSessionUuid(): string {
    return this.tracking?.sessionUuid ?? '';
  }

 loadTracking(): void {

  this.loading = true;

  this.mechanicService
    .getTracking(this.clientId)
    .subscribe({
      next: (tracking: MechanicClient) => {
        this.tracking = tracking;

        console.log('TRACKING', tracking);
        console.log('SESSION UUID', tracking.sessionUuid);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.error(err);

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
}
}