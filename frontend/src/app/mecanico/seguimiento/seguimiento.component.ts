import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SeguimientoChatComponent } from '../../components/seguimiento/chat/chat';
import { AuthStateService } from '../../services/auth-state.service';
import { MechanicClient, MechanicService } from '../../services/mechanic.service';
import { ChatApiService } from '../../services/chat-api.service';
import { ChatMessageResponse } from '../../services/api.models';

type ClientStatus = 'verde' | 'amarillo' | 'naranja' | 'rojo';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, MatStepperModule, SeguimientoChatComponent],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent implements OnInit {
  private static readonly TRACKING_UPDATE_PREFIX = '[ACTUALIZACION] ';

  private mechanicService = inject(MechanicService);
  private auth = inject(AuthStateService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private chatApi = inject(ChatApiService);

  message = '';
  updates: string[] = [];
  tracking: MechanicClient | null = null;
  loading = true;
  canEditTracking = false;
  selectedStepIndex = 0;

  clientId = 0;

  constructor() {
    const param = this.route.snapshot.queryParamMap.get('clientId') ?? this.route.snapshot.queryParamMap.get('clientid') ?? this.route.snapshot.queryParamMap.get('client');
    const parsed = Number(param);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.clientId = parsed;
    }

  }

  get isMechanic(): boolean {
    const role = this.auth.role();
    return role === 'TALLER' || role === 'ADMIN';
  }

  get status(): ClientStatus {
    return (this.tracking?.status ?? 'amarillo') as ClientStatus;
  }

  ngOnInit(): void {
    this.canEditTracking = this.isMechanic;

    this.route.queryParamMap.subscribe(params => {
      const clientId = Number(params.get('clientId') ?? params.get('clientid') ?? params.get('client'));
      if (!clientId) {
        return;
      }

      this.clientId = clientId;
      this.loadTracking();
    });

    if (this.clientId > 0) {
      this.loadTracking();
    }
  }

  onStepperSelectionChange(event: StepperSelectionEvent): void {
    if (!this.canEditTracking) {
      return;
    }

    if (event.selectedIndex === event.previouslySelectedIndex) {
      return;
    }

    const nextStatus: ClientStatus = event.selectedIndex === 2
      ? 'verde'
      : event.selectedIndex === 1
      ? 'naranja'
      : 'amarillo';

    this.setStatus(nextStatus);
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
        this.selectedStepIndex = this.computeStepIndex();
        this.loadTracking();
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

        this.publishTrackingUpdateToChat(trimmed);
        this.message = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error guardando actualización:', err);
      }
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

    this.mechanicService.getTracking(this.clientId).subscribe({
      next: (tracking: MechanicClient) => {
        this.tracking = tracking;
        this.selectedStepIndex = this.computeStepIndex();
        this.loadUpdateHistoryFromChat();

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

  private publishTrackingUpdateToChat(updateText: string): void {
    if (!this.tracking?.sessionUuid) {
      return;
    }

    const mechanicId = this.auth.userId();
    if (!mechanicId || !this.clientId) {
      return;
    }

    this.chatApi.sendMessage({
      participantId: this.clientId,
      roomType: 'SEGUIMIENTO',
      senderRole: 'MECANICO',
      sessionUuid: this.tracking.sessionUuid,
      commentText: `${SeguimientoComponent.TRACKING_UPDATE_PREFIX}${updateText}`
    }).subscribe({
      error: (err) => {
        console.warn('No se pudo publicar la actualización en el chat de seguimiento', err);
      }
    });
  }

  private loadUpdateHistoryFromChat(): void {
    if (!this.tracking?.sessionUuid) {
      return;
    }

    this.chatApi.listMessages(this.tracking.sessionUuid, 120).subscribe({
      next: (messages: ChatMessageResponse[]) => {
        this.updates = messages
          .filter((msg) => msg.senderRole === 'MECANICO' && msg.commentText.startsWith(SeguimientoComponent.TRACKING_UPDATE_PREFIX))
          .map((msg) => msg.commentText.replace(SeguimientoComponent.TRACKING_UPDATE_PREFIX, '').trim())
          .filter((text) => text.length > 0)
          .slice(-8)
          .reverse();

        this.cdr.detectChanges();
      },
      error: () => {
        // Keep existing local list if chat history fails.
      }
    });
  }

  private computeStepIndex(): number {
    if (this.tracking?.fixedAt) {
      return 2;
    }

    if (this.tracking?.inProgressAt || this.tracking?.acceptedAt) {
      return 1;
    }

    return 0;
  }
}