import { Component, OnInit, inject } from '@angular/core';
import { MechanicService, MechanicClient } from '../../../services/mechanic.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil-preferencias',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './preferencias.html',
  styleUrl: './preferencias.css'
})
export class PerfilPreferenciasComponent implements OnInit {
  private readonly authStateService = inject(AuthStateService);
  private readonly mechanicService = inject(MechanicService);

  tracking: MechanicClient | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const userId = this.authStateService.userId();
    if (userId === null) {
      this.isLoading = false;
      this.errorMessage = 'No se pudo identificar al usuario.';
      return;
    }

    this.mechanicService.getTrackingForClient(userId).subscribe({
      next: (data) => {
        this.tracking = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No tienes ningún seguimiento activo en este momento.';
      }
    });
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      verde: '●',
      amarillo: '●',
      naranja: '●',
      rojo: '●'
    };
    return icons[status] || '●';
  }

  get sessionUuid(): string | null {
    return this.tracking?.sessionUuid ?? null;
  }
}
