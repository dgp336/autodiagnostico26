import { Component, OnInit, inject } from '@angular/core';
import { MechanicService, MechanicClient } from '../../../services/mechanic.service';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-perfil-vehiculo',
  standalone: true,
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css'
})
export class PerfilVehiculoComponent implements OnInit {
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
        this.errorMessage = 'No tienes ningún vehículo asignado a un taller todavía.';
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
