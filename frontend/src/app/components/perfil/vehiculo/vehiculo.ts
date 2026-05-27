import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { PersonalVehicleApiService } from '../../../services/personal-vehicle-api.service';
import { PersonalVehicleResponse } from '../../../services/api.models';

@Component({
  selector: 'app-perfil-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css'
})
export class PerfilVehiculoComponent implements OnInit {
  private readonly auth = inject(AuthStateService);
  private readonly api = inject(PersonalVehicleApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  vehicles: PersonalVehicleResponse[] = [];
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadVehicles();
  }

  diagnosticar(vehicle: PersonalVehicleResponse): void {
    void this.router.navigate(['/home'], { queryParams: { personalVehicleId: vehicle.id } });
  }

  eliminar(vehicle: PersonalVehicleResponse): void {
    const ownerId = this.auth.userId();
    if (ownerId === null) return;
    if (!confirm('¿Eliminar este vehículo de tu garaje?')) return;

    this.api.delete(vehicle.id, ownerId).subscribe({
      next: () => {
        this.vehicles = this.vehicles.filter(v => v.id !== vehicle.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el vehículo';
        this.cdr.detectChanges();
      },
    });
  }

  displayName(v: PersonalVehicleResponse): string {
    const parts = [v.brand, v.vehicleName, v.modelName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Vehículo sin nombre';
  }

  private loadVehicles(): void {
    const ownerId = this.auth.userId();
    if (ownerId === null) {
      this.errorMessage = 'No se pudo identificar al usuario.';
      return;
    }
    this.loading = true;
    this.api.listByOwner(ownerId).subscribe({
      next: (list) => {
        this.vehicles = list;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus vehículos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
