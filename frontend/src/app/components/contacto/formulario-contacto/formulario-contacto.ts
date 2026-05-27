import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../services/auth-state.service';

const FORMSPREE_URL = 'https://formspree.io/f/xkoepwgv';

@Component({
  selector: 'app-formulario-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-contacto.html',
  styleUrl: './formulario-contacto.css'
})
export class FormularioContactoComponent {
  private readonly authState = inject(AuthStateService);

  readonly workshopId = input.required<number>();

  readonly done = output<void>();
  readonly cancel = output<void>();

  readonly name: string = this.authState.userName() || '';
  readonly email: string = this.authState.email() || '';
  phone = '';
  message = '';

  sending = false;
  error = '';
  success = false;

  async submit(): Promise<void> {
    if (!this.name || !this.email || !this.message) return;

    this.sending = true;
    this.error = '';
    this.success = false;

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          phone: this.phone || '',
          message: this.message,
          workshopId: this.workshopId(),
          _subject: `Consulta desde taller #${this.workshopId()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Formspree error');
      }

      this.sending = false;
      this.success = true;
      setTimeout(() => this.done.emit(), 2000);
    } catch {
      this.sending = false;
      this.error = 'No se ha podido enviar tu consulta. Inténtalo de nuevo.';
    }
  }
}
