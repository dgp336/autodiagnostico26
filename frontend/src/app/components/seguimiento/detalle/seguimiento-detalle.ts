import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { SeguimientoChatComponent } from '../chat/chat';
import { AuthStateService } from '../../../services/auth-state.service';
import { ChatApiService } from '../../../services/chat-api.service';
import { MechanicClient, MechanicService } from '../../../services/mechanic.service';

@Component({
  selector: 'app-seguimiento-detalle',
  standalone: true,
  imports: [CommonModule, MatStepperModule, SeguimientoChatComponent, DatePipe],
  providers: [DatePipe],
  templateUrl: './seguimiento-detalle.html',
  styleUrl: './seguimiento-detalle.css'
})
export class SeguimientoDetalleComponent implements OnInit, OnDestroy {
  private static readonly TRACKING_UPDATE_PREFIX = '[ACTUALIZACION] ';

  private readonly mechanicService = inject(MechanicService);
  private readonly chatApiService = inject(ChatApiService);
  private readonly authState = inject(AuthStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tracking: MechanicClient | null = null;
  trackingUpdates: Array<{ text: string; createdAt: string }> = [];
  sessionUuid = '';
  loading = true;
  participantId = 0;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  goBack(): void {
    this.router.navigate(['/usuario/seguimiento']);
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.authState.canAccessSeguimiento()) {
      return;
    }

    const userId = this.authState.userId();
    if (!userId) {
      return;
    }

    this.participantId = userId;

    this.route.queryParamMap.subscribe((params) => {
      const sessionUuid = params.get('sessionUuid') ?? localStorage.getItem('trackingSessionUuid') ?? '';
      if (!sessionUuid) {
        this.router.navigate(['/usuario/seguimiento']);
        return;
      }

      this.sessionUuid = sessionUuid;
      localStorage.setItem('trackingSessionUuid', sessionUuid);
      this.loadTracking();
    });
  }

  ngOnDestroy(): void {
    this.trackingUpdates = [];
  }

  getStatusLabel(status?: string | null): string {
    return {
      verde: 'Reparado',
      amarillo: 'Pendiente',
      naranja: 'En revision',
      rojo: 'Urgente'
    }[status ?? ''] || (status ?? '');
  }

  private loadTracking(): void {
    if (!this.sessionUuid) {
      return;
    }

    this.loading = true;
    this.mechanicService.getTrackingBySessionUuid(this.sessionUuid).subscribe({
      next: (tracking) => {
        this.tracking = tracking;
        this.loading = false;
        this.loadTrackingUpdates();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.tracking = null;
        this.trackingUpdates = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadTrackingUpdates(): void {
    if (!this.sessionUuid) {
      this.trackingUpdates = [];
      return;
    }

    this.chatApiService.listMessages(this.sessionUuid, 120).subscribe({
      next: (messages) => {
        this.trackingUpdates = messages
          .filter((message) => message.senderRole === 'MECANICO' && message.commentText.startsWith(SeguimientoDetalleComponent.TRACKING_UPDATE_PREFIX))
          .map((message) => ({
            text: message.commentText.replace(SeguimientoDetalleComponent.TRACKING_UPDATE_PREFIX, '').trim(),
            createdAt: message.createdAt
          }))
          .filter((item) => item.text.length > 0)
          .slice(-8)
          .reverse();

        this.cdr.detectChanges();
      },
      error: () => {
        // Keep the last visible list when message retrieval fails.
      }
    });
  }
}
