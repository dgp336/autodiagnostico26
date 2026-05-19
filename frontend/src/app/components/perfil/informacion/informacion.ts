import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserApiService } from '../../../services/user-api.service';
import { AuthUserResponse } from '../../../services/api.models';

@Component({
  selector: 'app-perfil-informacion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './informacion.html',
  styleUrl: './informacion.css'
})
export class PerfilInformacionComponent implements OnInit {
  private readonly authStateService = inject(AuthStateService);
  private readonly userApiService = inject(UserApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  profile: AuthUserResponse | null = null;
  isEditing = false;
  editFullName = '';
  editCity = '';
  editPostalCode = '';
  uploadingAvatar = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const userId = this.authStateService.userId();
    if (userId === null) {
      this.isLoading = false;
      this.errorMessage = 'No se pudo identificar al usuario. Inicia sesión de nuevo.';
      return;
    }

    this.userApiService.getProfile(userId).subscribe({
      next: (user) => {
        this.profile = user;
        this.editFullName = user.fullName;
        this.editCity = user.city || '';
        this.editPostalCode = user.postalCode || '';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar la información del perfil.';
        this.cdr.markForCheck();
      }
    });
  }

  get roleLabel(): string {
    if (!this.profile) return '';
    const labels: Record<string, string> = { USER: 'Usuario', TALLER: 'Mecánico', ADMIN: 'Administrador' };
    return labels[this.profile.role] || this.profile.role;
  }

  get createdAtFormatted(): string {
    if (!this.profile) return '';
    const date = new Date(this.profile.createdAt);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  triggerFileInput(): void {
    const input = document.getElementById('avatar-input') as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const userId = this.authStateService.userId();
    if (userId === null) return;

    this.uploadingAvatar = true;

    this.userApiService.uploadAvatar(userId, file).subscribe({
      next: (result) => {
        this.uploadingAvatar = false;
        if (this.profile) {
          this.profile.avatarUrl = result.avatarUrl;
        }
        this.authStateService.setSession({ userAvatar: result.avatarUrl });
        this.successMessage = 'Foto de perfil actualizada.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingAvatar = false;
        this.errorMessage = 'No se pudo subir la foto.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.isEditing && this.profile) {
      this.editFullName = this.profile.fullName;
      this.editCity = this.profile.city || '';
      this.editPostalCode = this.profile.postalCode || '';
    }
  }

  saveChanges(): void {
    const userId = this.authStateService.userId();
    if (userId === null) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (this.editPostalCode && !/^\d{5}$/.test(this.editPostalCode)) {
      this.errorMessage = 'El código postal debe tener exactamente 5 dígitos.';
      return;
    }

    const payload: Record<string, string> = {};
    if (this.editFullName) payload['fullName'] = this.editFullName;
    payload['city'] = this.editCity;
    payload['postalCode'] = this.editPostalCode;

    this.userApiService.updateProfile(userId, payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.isEditing = false;
        this.successMessage = 'Información actualizada correctamente.';
        this.authStateService.setSession({
          userName: updated.fullName,
          userAvatar: updated.avatarUrl
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar la información.';
        this.cdr.markForCheck();
      }
    });
  }
}
