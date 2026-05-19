import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent {
  private readonly authStateService = inject(AuthStateService);
  private readonly userApiService = inject(UserApiService);
  private readonly router = inject(Router);

  showDeleteModal = false;

  get userName(): string {
    return this.authStateService.userName();
  }

  onLogout(): void {
    this.authStateService.clearSession();
    void this.router.navigate(['/login']);
  }

  onDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    const userId = this.authStateService.userId();
    if (userId === null) return;
    this.showDeleteModal = false;
    this.userApiService.deleteAccount(userId).subscribe({
      next: () => this.onLogout(),
      error: () => {
        this.showDeleteModal = false;
      }
    });
  }
}
