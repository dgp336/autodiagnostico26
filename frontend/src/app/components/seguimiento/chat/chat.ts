import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatApiService } from '../../../services/chat-api.service';
import { ChatMessageRequest, ChatMessageResponse, ChatRoomType, ChatSenderRole } from '../../../services/api.models';
import { AuthStateService } from '../../../services/auth-state.service';

type ChatAuthor = 'mecanico' | 'usuario';

interface ChatMessage {
  id: number;
  author: ChatAuthor;
  own: boolean;
  text: string;
  at: string;
  read: boolean;
}

@Component({
  selector: 'app-seguimiento-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class SeguimientoChatComponent implements OnInit, OnDestroy {
  private readonly roomType: ChatRoomType = 'SEGUIMIENTO';
  private messageRefreshTimerId: number | null = null;
  private latestMessageId: number | null = null;

  userOnline = false;
  draft = '';
  sending = false;

  messages: ChatMessage[] = [];

  @Input() participantIdInput: number | null = null;
  @Input() sessionUuidInput: string | null = null;
  
  get currentUserId(): number {
    return this.authStateService.userId() ?? 0;
  }
  
  get participantId(): number {

    if (this.participantIdInput && this.participantIdInput > 0) {
      return this.participantIdInput;
    }

    return this.authStateService.userId() ?? 0;
  }

  get isMechanic(): boolean {
    const role = this.authStateService.role();
    return role === 'TALLER' || role === 'ADMIN';
  }

  get senderRole(): ChatSenderRole {
    return this.isMechanic ? 'MECANICO' : 'USUARIO';
  }

  get canSend(): boolean {
    if (this.isMechanic) {
      return true;
    }
    return this.messages.some((message) => message.author === 'mecanico');
  }

  get sessionUuid(): string {

    const provided = this.sessionUuidInput?.trim();

    if (provided) {
      return provided;
    }

    const stored = localStorage.getItem('trackingSessionUuid');

    return stored ?? '';
  }

  constructor(
    private readonly chatApiService: ChatApiService,
    private readonly authStateService: AuthStateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

    ngOnInit(): void {



      console.log('PARTICIPANT', this.participantId);
      console.log('SESSION UUID', this.sessionUuid);

      if (!this.participantId || !this.sessionUuid) {
        return;
      }

      this.joinChat();
    }

joinChat(): void {

  this.chatApiService
    .joinRoom(this.sessionUuid, this.participantId!)
    .subscribe({

      next: () => {

        console.log('JOIN OK');

        this.loadMessages();
        this.startMessageRefresh();

      },

      error: (err) => {
        console.error(err);
      }
    });
}
loadMessages(): void {

  this.chatApiService
    .getMessages(this.sessionUuid)
    .subscribe({

      next: (messages: ChatMessageResponse[]) => {

        this.messages = messages.map(
          (message) => this.toViewMessage(message)
        );

        console.log('MESSAGES', this.messages);

        this.latestMessageId =
          messages.length > 0
            ? messages[messages.length - 1].id
            : null;
      },

      error: (err: any) => {
        console.error(err);
      }
    });
}
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId) || !this.authStateService.canAccessSeguimiento()) {
      return;
    }

    const participantId = this.participantId;
    if (!participantId || participantId === 0) {
      return;
    }

    this.stopMessageRefresh();
    this.chatApiService.leaveRoom(this.sessionUuid, participantId).subscribe();
  }

  get unreadCount(): number {
    return this.messages.filter((msg) => msg.author === 'mecanico' && !msg.read).length;
  }

  sendMessage(): void {
    const value = this.draft.trim();
    if (!value) {
      return;
    }

    if (!this.canSend) {
      console.warn('Solo el mecanico puede iniciar la conversacion');
      return;
    }

    const userId = this.currentUserId;
    if (!userId || userId === 0) {
      console.error('Cannot send message: No valid user ID');
      return;
    }

    this.sending = true;

    const payload: ChatMessageRequest = {
      participantId: this.participantId,
      roomType: this.roomType,
      senderRole: this.senderRole,
      sessionUuid: this.sessionUuid,
      commentText: value
    };

    this.chatApiService.sendMessage(payload).subscribe({
      next: (sentMessage) => {
        this.sending = false;
        this.upsertMessages([sentMessage]);
        this.draft = '';
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.sending = false;
      }
    });
  }

  private fetchMessages(): void {
    this.chatApiService.listMessages(this.sessionUuid, 60).subscribe({
      next: (messages) => {
        this.messages = messages.map((message) => this.toViewMessage(message));
        this.latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
      }
    });
  }

  private fetchNewMessages(): void {
    if (!this.latestMessageId) {
      return;
    }

    this.chatApiService.listMessages(this.sessionUuid, 60, this.latestMessageId).subscribe({
      next: (messages) => {
        this.upsertMessages(messages);
        this.cdr.detectChanges();
      }
    });
  }

  private refreshPresence(): void {
    const participantId = this.participantId;
    if (!participantId || participantId === 0) {
      return;
    }

    this.chatApiService.isUserOnline(this.sessionUuid, participantId).subscribe({
      next: (isOnline) => {
        this.userOnline = isOnline;
      }
    });
  }

  private startMessageRefresh(): void {
    this.stopMessageRefresh();
    this.ngZone.runOutsideAngular(() => {
      this.messageRefreshTimerId = window.setInterval(() => {
        this.ngZone.run(() => {
          this.fetchNewMessages();
          this.refreshPresence();
          this.cdr.detectChanges();
        });
      }, 5000);
    });
  }

  private stopMessageRefresh(): void {
    if (this.messageRefreshTimerId !== null) {
      window.clearInterval(this.messageRefreshTimerId);
      this.messageRefreshTimerId = null;
    }
  }

  private upsertMessages(incoming: ChatMessageResponse[]): void {
    if (!incoming.length) {
      return;
    }

    const lastId = this.latestMessageId ?? 0;
    const newMessages = incoming.filter((message) => message.id > lastId);
    if (!newMessages.length) {
      return;
    }

    this.messages = [
      ...this.messages,
      ...newMessages.map((message) => this.toViewMessage(message))
    ].slice(-120);

    this.latestMessageId = this.messages[this.messages.length - 1].id;
  }

  private toViewMessage(message: ChatMessageResponse): ChatMessage {
    const parsedDate = new Date(message.createdAt);
    const hasValidDate = !Number.isNaN(parsedDate.getTime());

    const isMyMessage = this.isMechanic ? message.senderRole === 'MECANICO' : message.senderRole === 'USUARIO';
    const isMechanicMessage = message.senderRole === 'MECANICO';

    return {
      id: message.id,
      author: isMechanicMessage ? 'mecanico' : 'usuario',
      own: isMyMessage,
      text: message.commentText,
      at: hasValidDate ? parsedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      read: message.readByUser
    };
  }
}
