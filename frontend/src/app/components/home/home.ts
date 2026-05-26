import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IntroducirVehiculo } from '../introducir-vehiculo/introducir-vehiculo';
import { SeleccionaProblema, ProblemaSeleccion } from '../selecciona-problema/selecciona-problema';
import { SelectorMisVehiculos } from '../selector-mis-vehiculos/selector-mis-vehiculos';
import { VehicleSearchContext, PersonalVehicleResponse } from '../../services/api.models';
import { AuthStateService } from '../../services/auth-state.service';
import { PersonalVehicleApiService } from '../../services/personal-vehicle-api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IntroducirVehiculo, SeleccionaProblema, SelectorMisVehiculos],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthStateService);
  private readonly personalVehicleApi = inject(PersonalVehicleApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  vehicleContext: VehicleSearchContext | null = null;
  seleccion: ProblemaSeleccion = { problemas: [], descripcionLibre: '' };

  personalVehicles: PersonalVehicleResponse[] = [];
  selectedPersonalVehicleId: number | null = null;
  prefillContext: VehicleSearchContext | null = null;
  submitError = '';
  saveVehicleMessage = '';
  saveVehicleError = '';
  savingVehicle = false;

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
          this.cdr.detectChanges();
          return;
        }

        const storedIdRaw = localStorage.getItem('selectedPersonalVehicleId');
        const storedId = storedIdRaw ? Number(storedIdRaw) : null;
        if (storedId && vehicles.some(v => v.id === storedId)) {
          this.applyPersonalVehicle(storedId);
          this.cdr.detectChanges();
          return;
        }

        if (vehicles.length === 1) {
          this.applyPersonalVehicle(vehicles[0].id);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        // silencioso: el usuario puede seguir introduciendo a mano
        this.cdr.detectChanges();
      },
    });
  }

  onPersonalVehicleSelect(id: number | null): void {
    this.submitError = '';
    this.saveVehicleMessage = '';
    this.saveVehicleError = '';
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
    this.saveVehicleError = '';
    this.vehicleContext = ctx;

    if (this.selectedPersonalVehicleId !== null && this.divergesFromSelected(ctx)) {
      this.selectedPersonalVehicleId = null;
      this.prefillContext = null;
      this.saveVehicleMessage = '';
      localStorage.removeItem('selectedPersonalVehicleId');
    }
  }

  private divergesFromSelected(ctx: VehicleSearchContext): boolean {
    const selected = this.personalVehicles.find(v => v.id === this.selectedPersonalVehicleId);
    if (!selected) return false;
    return ctx.brand !== selected.brand
      || ctx.modelId !== selected.vehicleId
      || ctx.variantId !== selected.vehicleModelId;
  }

  onProblemaChange(seleccion: ProblemaSeleccion): void {
    this.submitError = '';
    this.seleccion = seleccion;
  }

  onEnviar(): void {
    const clientId = this.auth.userId();

    if (this.selectedPersonalVehicleId !== null) {
      this.submitError = '';
      this.navigateToDiagnostico(clientId, this.selectedPersonalVehicleId);
      return;
    }

    const vehicleModelId = this.vehicleContext?.variantId ?? this.vehicleContext?.modelId;
    if (vehicleModelId === null || vehicleModelId === undefined) {
      this.submitError = 'Indica al menos marca y modelo del coche para enviar el diagnóstico.';
      return;
    }

    this.submitError = '';
    this.navigateToDiagnostico(clientId, null);
  }

  get canSaveVehicle(): boolean {
    if (!this.isLoggedIn || this.savingVehicle) return false;
    if (this.selectedPersonalVehicleId !== null) return false;
    return this.vehicleContext?.variantId != null;
  }

  onGuardarCoche(): void {
    if (!this.canSaveVehicle) return;

    const ownerId = this.auth.userId();
    const vehicleModelId = this.vehicleContext?.variantId ?? null;
    if (ownerId === null || vehicleModelId === null) {
      return;
    }

    this.saveVehicleError = '';
    this.saveVehicleMessage = '';
    this.savingVehicle = true;

    this.personalVehicleApi.create({
      ownerId,
      vehicleModelId,
      plate: null,
      vin: null,
      buildDate: null,
    }).subscribe({
      next: (created: PersonalVehicleResponse) => {
        this.personalVehicles = [created, ...this.personalVehicles];
        this.savingVehicle = false;
        this.saveVehicleMessage = 'Coche guardado en tu garaje. Ya puedes seleccionarlo de la lista.';
        this.applyPersonalVehicle(created.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.savingVehicle = false;
        this.saveVehicleError = 'No se pudo guardar el coche. Inténtalo de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }

  private navigateToDiagnostico(clientId: number | null, personalVehicleId: number | null): void {
    this.router.navigate(['/diagnostico'], {
      state: {
        vehicle: this.vehicleContext,
        problemas: this.seleccion,
        clientId,
        personalVehicleId,
      },
    });
  }

  private applyPersonalVehicle(id: number): void {
    const vehicle = this.personalVehicles.find(v => v.id === id);
    if (!vehicle) return;
    this.selectedPersonalVehicleId = id;
    localStorage.setItem('selectedPersonalVehicleId', String(id));
    const selectedContext: VehicleSearchContext = {
      brand: vehicle.brand,
      modelId: vehicle.vehicleId,
      modelName: vehicle.vehicleName,
      variantId: vehicle.vehicleModelId,
      variantName: vehicle.modelName,
      engineType: vehicle.engineType,
      transmission: vehicle.transmission,
      year: vehicle.year,
    };

    this.prefillContext = selectedContext;
    this.vehicleContext = selectedContext;
    this.cdr.detectChanges();
  }
}
