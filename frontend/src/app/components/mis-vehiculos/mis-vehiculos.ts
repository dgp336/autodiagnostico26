import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { PersonalVehicleApiService } from '../../services/personal-vehicle-api.service';
import { PersonalVehicleResponse } from '../../services/api.models';
import { IntroducirVehiculo, GuardarCochePayload } from '../introducir-vehiculo/introducir-vehiculo';

@Component({
  selector: 'app-mis-vehiculos-page',
  standalone: true,
  imports: [CommonModule, IntroducirVehiculo],
  templateUrl: './mis-vehiculos.html',
  styleUrl: './mis-vehiculos.css',
})
export class MisVehiculosComponent implements OnInit {
  private readonly auth = inject(AuthStateService);
  private readonly api = inject(PersonalVehicleApiService);
  private readonly router = inject(Router);

  @ViewChild(IntroducirVehiculo) introducirVehiculo?: IntroducirVehiculo;

  vehicles: PersonalVehicleResponse[] = [];
  loading = false;
  showAddForm = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadVehicles();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = null;
  }

  onGuardarCoche(payload: GuardarCochePayload): void {
    const ownerId = this.auth.userId();
    if (ownerId === null) {
      this.errorMessage = 'Debes iniciar sesión para guardar un vehículo';
      this.introducirVehiculo?.notifySaveFailed();
      return;
    }

    this.errorMessage = null;
    this.api.create({
      ownerId,
      vehicleModelId: payload.vehicleModelId,
      plate: payload.plate,
      vin: payload.vin,
      buildDate: payload.buildDate,
    }).subscribe({
      next: (created: PersonalVehicleResponse) => {
        this.vehicles = [created, ...this.vehicles];
        this.introducirVehiculo?.notifySaved();
        this.showAddForm = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el vehículo';
        this.introducirVehiculo?.notifySaveFailed();
      },
    });
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
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el vehículo';
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
      return;
    }
    this.loading = true;
    this.api.listByOwner(ownerId).subscribe({
      next: (list: PersonalVehicleResponse[]) => {
        this.vehicles = list;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus vehículos';
        this.loading = false;
      },
    });
  }
}
