import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { AuthUserResponse } from '../../services/api.models';

type UserRoleFilter = 'ALL' | 'USER' | 'TALLER' | 'ADMIN';

@Component({
  selector: 'app-admin-gestionusuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gestionusuarios.html',
  styleUrl: './admin-gestionusuarios.css',
})
export class AdminGestionUsuariosComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly authState = inject(AuthStateService);
  readonly currentUserId = this.authState.userId;

  readonly users = signal<AuthUserResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly searchTerm = signal('');
  readonly roleFilter = signal<UserRoleFilter>('ALL');
  readonly deletingUserId = signal<number | null>(null);

  readonly filteredUsers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const roleFilter = this.roleFilter();

    return this.users().filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const haystack = `${user.fullName} ${user.email} ${user.city ?? ''} ${user.postalCode ?? ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesRole && matchesSearch;
    });
  });

  readonly totalUsers = computed(() => this.users().length);
  readonly totalClients = computed(() => this.users().filter((user) => user.role === 'USER').length);
  readonly totalMechanics = computed(() => this.users().filter((user) => user.role === 'TALLER').length);
  readonly totalAdmins = computed(() => this.users().filter((user) => user.role === 'ADMIN').length);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userApi.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de usuarios.');
        this.loading.set(false);
      },
    });
  }

  deleteUser(user: AuthUserResponse): void {
    if (user.id === this.currentUserId()) {
      this.error.set('No puedes eliminar tu propia cuenta desde este panel.');
      return;
    }

    const confirmed = window.confirm(`¿Eliminar a ${user.fullName}?`);
    if (!confirmed) {
      return;
    }

    this.deletingUserId.set(user.id);
    this.error.set('');

    this.userApi.deleteAccount(user.id).subscribe({
      next: () => {
        this.deletingUserId.set(null);
        this.loadUsers();
      },
      error: (err) => {
        this.deletingUserId.set(null);
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el usuario.');
      },
    });
  }

  roleLabel(role: AuthUserResponse['role']): string {
    const labels: Record<AuthUserResponse['role'], string> = {
      USER: 'Cliente',
      TALLER: 'Mecánico',
      ADMIN: 'Administrador',
    };
    return labels[role] ?? role;
  }

  trackByUserId(_: number, user: AuthUserResponse): number {
    return user.id;
  }
}