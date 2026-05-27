import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  trackings: MechanicClient[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const userId = this.authStateService.userId();
    if (userId === null) {
      this.isLoading = false;
      this.errorMessage = 'No se pudo identificar al usuario.';
      return;
    }

    this.mechanicService.getTrackingsForClient(userId).subscribe({
      next: (data) => {
        this.trackings = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.errorMessage = 'No tienes ningún seguimiento activo en este momento.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No tienes ningún seguimiento activo en este momento.';
        this.cdr.detectChanges();
      }
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      verde: 'Correcto',
      amarillo: 'En revisión',
      naranja: 'Atención',
      rojo: 'Urgente'
    };
    return labels[status] || status;
  }
}
