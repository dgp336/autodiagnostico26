import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-cambiar-rol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cambiar-rol.html',
  styleUrl: './cambiar-rol.css'
})
export class CambiarRolComponent {
  private authState = inject(AuthStateService);
  private userApi = inject(UserApiService);
  private router = inject(Router);

  isUpgrading = signal(false);
  success = signal(false);
  error = signal('');

  get isAlreadyMechanic(): boolean {
    return this.authState.role() === 'TALLER';
  }

  upgradeToMechanic() {
    if (this.isAlreadyMechanic) return;

    const userId = this.authState.userId();
    if (!userId) {
      this.error.set('Debes iniciar sesión para cambiar tu rol.');
      return;
    }

    this.isUpgrading.set(true);
    this.error.set('');

    this.userApi.upgradeRole(userId, 'TALLER').subscribe({
      next: (updatedUser) => {
        // Actualizar la sesión local con el rol devuelto por el backend
        this.authState.setSession({ role: updatedUser.role });
        this.isUpgrading.set(false);
        this.success.set(true);

        // Redirigir al registro de taller
        setTimeout(() => {
          this.router.navigate(['/registro-taller']);
        }, 2000);
      },
      error: (err) => {
        this.isUpgrading.set(false);
        this.error.set(err?.error?.message || 'Error al actualizar el rol. Inténtalo de nuevo.');
      }
    });
  }
}
