import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { UserApiService } from '../../services/user-api.service';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent {
  readonly authStateService = inject(AuthStateService);
  private readonly userApiService = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

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
      next: () => {
        this.cdr.detectChanges();
        this.onLogout();
      },
      error: () => {
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      }
    });
  }
}
