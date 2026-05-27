import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

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

    // Updated service returns an array of trackings
    this.mechanicService.getTrackingsForClient(userId).subscribe({
      next: (data: MechanicClient[]) => {
        // Use the first tracking if available
        this.tracking = data.length > 0 ? data[0] : null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No tienes ningún vehículo asignado a un taller todavía.';
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
