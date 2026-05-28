import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
type StepStatus = ClientStatus;

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
  private chatApi = inject(ChatApiService);

  message = '';
  updates: string[] = [];
  tracking: MechanicClient | null = null;
  loading = true;
  canEditTracking = false;
  selectedStepIndex = 0;
  private initialLoadCompleted = false;

  clientId = 0;
  sessionUuid = '';

  constructor() {}

  get isMechanic(): boolean {
    const role = this.auth.role();
    return role === 'TALLER' || role === 'ADMIN';
  }

  getStatusLabel(status: string): string {
    return {
      rojo: 'Pendiente de aceptar',
      amarillo: 'Cita agendada',
      naranja: 'En revisión',
      verde: 'Reparado'
    }[status] || status;
  }

  ngOnInit(): void {
    this.canEditTracking = this.isMechanic;

    this.route.queryParamMap.subscribe(params => {
      const sessionUuid = params.get('sessionUuid') ?? '';
      if (!sessionUuid) {
        return;
      }

      const sessionChanged = sessionUuid !== this.sessionUuid;
      this.sessionUuid = sessionUuid;
      if (sessionChanged || !this.initialLoadCompleted) {
        this.loadTracking(!this.initialLoadCompleted);
      }
    });
  }

  onStepperSelectionChange(event: StepperSelectionEvent): void {
    if (!this.canEditTracking) {
      return;
    }

    if (event.selectedIndex === event.previouslySelectedIndex) {
      return;
    }

    const nextStatus: StepStatus = (['rojo', 'amarillo', 'naranja', 'verde'][event.selectedIndex] ?? 'rojo') as StepStatus;

    this.setStatus(nextStatus);
  }

  setStatus(status: ClientStatus): void {
    const mechanicId = this.auth.userId();
    if (!mechanicId) {
      return;
    }

    const sessionUuid = this.tracking?.sessionUuid ?? this.sessionUuid;
    if (!sessionUuid) {
      return;
    }

    this.mechanicService.updateTrackingStatus(mechanicId, sessionUuid, status).subscribe({
      next: () => {
        if (this.tracking) {
          this.tracking.status = status;
        }
        this.selectedStepIndex = this.computeStepIndex();
        this.loadTracking(false);
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

    const sessionUuid = this.tracking?.sessionUuid ?? this.sessionUuid;
    if (!sessionUuid) {
      return;
    }

    this.mechanicService.updateTrackingMessageBySessionUuid(mechanicId, sessionUuid, trimmed).subscribe({
      next: () => {
        this.updates = [trimmed, ...this.updates].slice(0, 8);
        if (this.tracking) {
          this.tracking.latestUpdate = trimmed;
        }

        this.publishTrackingUpdateToChat(trimmed);
        this.message = '';
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
    return this.tracking?.sessionUuid ?? this.sessionUuid ?? '';
  }

  loadTracking(showLoading = !this.initialLoadCompleted): void {
    if (showLoading) {
      this.loading = true;
    }

    if (!this.sessionUuid) {
      if (showLoading) {
        this.loading = false;
      }
      return;
    }

    const tracking$ = this.mechanicService.getTrackingBySessionUuid(this.sessionUuid);

    tracking$.subscribe({
      next: (tracking: MechanicClient) => {
        this.tracking = tracking;
        this.clientId = tracking.clientId;
        this.sessionUuid = tracking.sessionUuid;
        this.selectedStepIndex = this.computeStepIndex();
        this.loadUpdateHistoryFromChat();

        this.initialLoadCompleted = true;
        if (showLoading) {
          this.loading = false;
        }
      },
      error: (err: any) => {
        console.error(err);
        if (showLoading) {
          this.loading = false;
        }
      }
    });
  }

  private publishTrackingUpdateToChat(updateText: string): void {
    if (!this.tracking?.sessionUuid) {
      return;
    }

    const mechanicId = this.auth.userId();
    if (!mechanicId) {
      return;
    }

    this.chatApi.sendMessage({
      participantId: mechanicId,
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
      },
      error: () => {
        // Keep existing local list if chat history fails.
      }
    });
  }

  private computeStepIndex(): number {
    switch (this.tracking?.status as ClientStatus | undefined) {
      case 'verde':
        return 3;
      case 'naranja':
        return 2;
      case 'amarillo':
        return 1;
      case 'rojo':
      default:
        return 0;
    }
  }
}