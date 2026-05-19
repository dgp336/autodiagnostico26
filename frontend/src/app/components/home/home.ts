import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IntroducirVehiculo } from '../introducir-vehiculo/introducir-vehiculo';
import { SeleccionaProblema, ProblemaSeleccion } from '../selecciona-problema/selecciona-problema';
import { VehicleSearchContext, PersonalVehicleResponse } from '../../services/api.models';
import { AuthStateService } from '../../services/auth-state.service';
import { PersonalVehicleApiService } from '../../services/personal-vehicle-api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IntroducirVehiculo, SeleccionaProblema],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthStateService);
  private readonly personalVehicleApi = inject(PersonalVehicleApiService);

  vehicleContext: VehicleSearchContext | null = null;
  seleccion: ProblemaSeleccion = { problemas: [], descripcionLibre: '' };

  personalVehicles: PersonalVehicleResponse[] = [];
  selectedPersonalVehicleId: number | null = null;
  prefillContext: VehicleSearchContext | null = null;
  submitError = '';
  private creatingVehicle = false;

  get tieneProblema(): boolean {
    return this.seleccion.problemas.length > 0 || !!this.seleccion.descripcionLibre.trim();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  ngOnInit(): void {
    if (!this.isLoggedIn) {
      return;
    }
    const ownerId = this.auth.userId();
    if (ownerId === null) {
      return;
    }

    const paramId = this.route.snapshot.queryParamMap.get('personalVehicleId');
    const preselectId = paramId ? Number(paramId) : null;

    this.personalVehicleApi.listByOwner(ownerId).subscribe({
      next: (vehicles: PersonalVehicleResponse[]) => {
        this.personalVehicles = vehicles;
        if (preselectId && vehicles.some(v => v.id === preselectId)) {
          this.applyPersonalVehicle(preselectId);
          return;
        }

        const storedIdRaw = localStorage.getItem('selectedPersonalVehicleId');
        const storedId = storedIdRaw ? Number(storedIdRaw) : null;
        if (storedId && vehicles.some(v => v.id === storedId)) {
          this.applyPersonalVehicle(storedId);
          return;
        }

        if (vehicles.length === 1) {
          this.applyPersonalVehicle(vehicles[0].id);
        }
      },
      error: () => {
        // silencioso: el usuario puede seguir introduciendo a mano
      },
    });
  }

  onPersonalVehicleSelect(id: number | null): void {
    this.submitError = '';
    this.selectedPersonalVehicleId = id;
    if (id === null) {
      this.prefillContext = null;
      localStorage.removeItem('selectedPersonalVehicleId');
      return;
    }
    this.applyPersonalVehicle(id);
  }

  onVehicleContextChange(ctx: VehicleSearchContext): void {
    this.submitError = '';
    this.vehicleContext = ctx;
  }

  onProblemaChange(seleccion: ProblemaSeleccion): void {
    this.submitError = '';
    this.seleccion = seleccion;
  }

  onEnviar(): void {
    if (this.creatingVehicle) {
      return;
    }

    const clientId = this.auth.userId();
    if (clientId === null) {
      this.submitError = 'Debes iniciar sesión para enviar el diagnóstico.';
      return;
    }

    if (this.selectedPersonalVehicleId !== null) {
      this.submitError = '';
      this.navigateToDiagnostico(clientId, this.selectedPersonalVehicleId);
      return;
    }

    if (this.personalVehicles.length > 0) {
      this.submitError = 'Selecciona uno de tus coches guardados para continuar.';
      return;
    }

    const vehicleModelId = this.vehicleContext?.variantId ?? this.vehicleContext?.modelId;
    if (vehicleModelId === null || vehicleModelId === undefined) {
      this.submitError = 'Indica al menos marca y modelo del coche para guardarlo automáticamente.';
      return;
    }

    this.submitError = '';
    this.creatingVehicle = true;

    this.personalVehicleApi.create({
      ownerId: clientId,
      vehicleModelId,
      plate: null,
      vin: null,
      buildDate: null,
    }).subscribe({
      next: (created: PersonalVehicleResponse) => {
        this.personalVehicles = [created, ...this.personalVehicles];
        this.selectedPersonalVehicleId = created.id;
        localStorage.setItem('selectedPersonalVehicleId', String(created.id));
        this.creatingVehicle = false;
        this.navigateToDiagnostico(clientId, created.id);
      },
      error: () => {
        this.creatingVehicle = false;
        this.submitError = 'No se pudo guardar tu coche automáticamente. Revísalo en Mis Vehículos e inténtalo de nuevo.';
      },
    });
  }

  private navigateToDiagnostico(clientId: number, personalVehicleId: number): void {
    this.router.navigate(['/diagnostico'], {
      state: {
        vehicle: this.vehicleContext,
        problemas: this.seleccion,
        clientId,
        personalVehicleId,
      },
    });
  }

  displayName(v: PersonalVehicleResponse): string {
    const parts = [v.brand, v.vehicleName, v.modelName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : `Vehículo #${v.id}`;
  }

  private applyPersonalVehicle(id: number): void {
    const vehicle = this.personalVehicles.find(v => v.id === id);
    if (!vehicle) return;
    this.selectedPersonalVehicleId = id;
    localStorage.setItem('selectedPersonalVehicleId', String(id));
    this.prefillContext = {
      brand: vehicle.brand,
      modelId: null,
      modelName: vehicle.vehicleName,
      variantId: vehicle.vehicleModelId,
      variantName: vehicle.modelName,
      engineType: vehicle.engineType,
      transmission: vehicle.transmission,
      year: vehicle.year,
    };
  }
}
