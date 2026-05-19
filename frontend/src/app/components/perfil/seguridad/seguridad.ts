import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserApiService } from '../../../services/user-api.service';

@Component({
  selector: 'app-perfil-seguridad',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './seguridad.html',
  styleUrl: './seguridad.css'
})
export class PerfilSeguridadComponent {
  private readonly authStateService = inject(AuthStateService);
  private readonly userApiService = inject(UserApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  newEmail = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  emailError = '';
  emailSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  get emailLabel(): string {
    return this.authStateService.email() || 'No disponible';
  }

  updateEmail(): void {
    const userId = this.authStateService.userId();
    if (userId === null) return;

    this.emailError = '';
    this.emailSuccess = '';

    if (!this.newEmail.trim()) {
      this.emailError = 'Escribe el nuevo correo electrónico.';
      return;
    }

    const newEmailValue = this.newEmail.trim();
    this.newEmail = '';

    this.userApiService.updateProfile(userId, { email: newEmailValue }).subscribe({
      next: (updated) => {
        this.emailSuccess = 'Correo electrónico actualizado correctamente.';
        this.authStateService.setSession({ email: updated.email });
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.emailError = 'Ya existe una cuenta con ese correo electrónico.';
        } else {
          this.emailError = 'No se pudo actualizar el correo electrónico. Inténtalo de nuevo más tarde.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  updatePassword(): void {
    const userId = this.authStateService.userId();
    if (userId === null) return;

    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.currentPassword) {
      this.passwordError = 'Escribe tu contraseña actual.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    const currentPassValue = this.currentPassword;
    const newPassValue = this.newPassword;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    this.userApiService.updatePassword(userId, {
      currentPassword: currentPassValue,
      newPassword: newPassValue
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Contraseña actualizada correctamente.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.passwordError = 'La contraseña actual no es correcta.';
        this.cdr.markForCheck();
      }
    });
  }
}
