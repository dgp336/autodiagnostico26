import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactApiService } from '../../services/contact-api.service';
import { ContactMessage } from '../../services/api.models';

@Component({
  selector: 'app-admin-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-contacto.html',
  styleUrls: ['./admin-contacto.css'],
})
export class AdminContactoComponent implements OnInit {
  private readonly contactApi = inject(ContactApiService);

  readonly messages = signal<ContactMessage[]>([]);
  readonly pendingCount = computed(() => this.messages().filter(m => !m.repliedAt).length);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly replyTarget = signal<ContactMessage | null>(null);
  readonly replyText = signal('');
  readonly sendingReply = signal(false);
  readonly replyError = signal('');

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.error.set('');
    this.contactApi.listMessages().subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los mensajes.');
        this.loading.set(false);
      },
    });
  }

  openReply(msg: ContactMessage): void {
    this.replyTarget.set(msg);
    this.replyText.set('');
    this.replyError.set('');
  }

  closeReply(): void {
    this.replyTarget.set(null);
    this.replyText.set('');
    this.replyError.set('');
  }

  sendReply(): void {
    const target = this.replyTarget();
    if (!target || !this.replyText().trim()) return;

    this.sendingReply.set(true);
    this.replyError.set('');

    this.contactApi.reply(target.id, { message: this.replyText() }).subscribe({
      next: () => {
        this.sendingReply.set(false);
        this.closeReply();
        this.loadMessages();
      },
      error: (err) => {
        this.sendingReply.set(false);
        this.replyError.set(err?.error?.message || 'No se pudo enviar la respuesta.');
      },
    });
  }
}
