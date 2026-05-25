import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutodiagnosisApiService } from '../../services/autodiagnosis-api.service';
import {
  AutodiagnosisRequest,
  AutodiagnosisResponse,
  VehicleSearchContext,
} from '../../services/api.models';
import { ProblemaSeleccion } from '../selecciona-problema/selecciona-problema';

interface DiagnosticoNavState {
  vehicle: VehicleSearchContext | null;
  problemas: ProblemaSeleccion | null;
  clientId: number | null;
  personalVehicleId: number | null;
}

@Component({
  selector: 'app-diagnostico-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostico.html',
  styleUrls: ['./diagnostico.css'],
})
export class DiagnosticoComponent implements OnInit {
  private readonly api = inject(AutodiagnosisApiService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly savingIssue = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly resultado = signal<AutodiagnosisResponse | null>(null);

  private navState: DiagnosticoNavState | null = null;
  private payload: AutodiagnosisRequest | null = null;

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras.state ?? null) as DiagnosticoNavState | null;
    this.navState = state;
  }

  ngOnInit(): void {
    const state = this.navState;
    if (!state || !state.vehicle || !state.problemas) {
      this.errorMessage.set(
        'No se encontró el contexto del diagnóstico. Vuelva al inicio y complete el formulario.',
      );
      return;
    }

    const vehicleModelId = state.vehicle.variantId ?? state.vehicle.modelId;
    if (vehicleModelId == null) {
      this.errorMessage.set('Es necesario seleccionar un modelo de vehículo antes de diagnosticar.');
      return;
    }

    const symptoms = [...state.problemas.problemas];
    const freeText = state.problemas.descripcionLibre ?? '';

    if (symptoms.length === 0 && !freeText.trim()) {
      this.errorMessage.set('Debe indicar al menos un síntoma o una descripción del problema.');
      return;
    }

    if (state.clientId == null || state.personalVehicleId == null) {
      this.errorMessage.set('No se pudo resolver el cliente o el vehículo seleccionado.');
      return;
    }

    const payload: AutodiagnosisRequest = {
      clientId: state.clientId,
      personalVehicleId: state.personalVehicleId,
      vehicleModelId,
      symptoms,
      freeText,
      year: state.vehicle.year,
      engineType: state.vehicle.engineType,
      transmission: state.vehicle.transmission,
    };

    this.payload = payload;

    this.loading.set(true);
    this.api.diagnose(payload).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Error desconocido al consultar el diagnóstico.';
        this.errorMessage.set(msg);
        this.loading.set(false);
      },
    });
  }

  aceptarDiagnostico(): void {
    if (this.savingIssue() || this.payload == null || this.resultado() == null) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.savingIssue.set(true);
    this.api.createIssue(this.payload).subscribe({
      next: () => {
        this.savingIssue.set(false);
        this.successMessage.set('Diagnóstico guardado correctamente. Redirigiendo a talleres...');
        setTimeout(() => {
          this.router.navigate(['/taller']);
        }, 900);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'No se pudo guardar el diagnóstico.';
        this.errorMessage.set(msg);
        this.successMessage.set(null);
        this.savingIssue.set(false);
      },
    });
  }

  volverAHome(): void {
    this.router.navigate(['/home']);
  }
}
