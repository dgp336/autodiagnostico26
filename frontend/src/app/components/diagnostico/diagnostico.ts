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
  template: `
    <section class="diagnostico-page">
      @if (successMessage()) {
        <div class="estado estado--success" role="status" aria-live="polite">
          <p>{{ successMessage() }}</p>
        </div>
      }

      @if (loading()) {
        <div class="estado estado--loading">
          <p>Analizando síntomas con el asistente IA…</p>
        </div>
      } @else if (errorMessage()) {
        <div class="estado estado--error">
          <h2>No se pudo completar el diagnóstico</h2>
          <p>{{ errorMessage() }}</p>
          <button type="button" (click)="volverAHome()">Volver</button>
        </div>
      } @else if (resultado(); as r) {
        <header class="cabecera">
          <h1>Diagnóstico estimado</h1>
          <p class="diagnosis">{{ r.diagnosis }}</p>

          <div class="confidence" [attr.aria-label]="'Confianza ' + (r.confidence * 100 | number:'1.0-0') + '%'">
            <span class="confidence__label">Confianza:</span>
            <div class="confidence__bar">
              <div class="confidence__fill" [style.width.%]="r.confidence * 100"></div>
            </div>
            <span class="confidence__value">{{ (r.confidence * 100) | number:'1.0-0' }}%</span>
          </div>

          @if (r.explanation) {
            <p class="explanation">{{ r.explanation }}</p>
          }
        </header>

        @if (r.suggestedParts.length > 0) {
          <h2>Piezas sugeridas</h2>
          <ul class="piezas">
            @for (p of r.suggestedParts; track p.idProduct) {
              <li class="pieza">
                @if (p.image) {
                  <img [src]="p.image" [alt]="p.name" loading="lazy" />
                }
                <div class="pieza__info">
                  <h3>{{ p.name }}</h3>
                  @if (p.description) {
                    <p>{{ p.description }}</p>
                  }
                  @if (p.lowRangePrice !== null || p.highRangePrice !== null) {
                    <p class="pieza__precio">
                      @if (p.lowRangePrice !== null && p.highRangePrice !== null) {
                        {{ p.lowRangePrice }}€ – {{ p.highRangePrice }}€
                      } @else if (p.lowRangePrice !== null) {
                        desde {{ p.lowRangePrice }}€
                      } @else {
                        hasta {{ p.highRangePrice }}€
                      }
                    </p>
                  }
                </div>
              </li>
            }
          </ul>
        } @else {
          <p class="sin-piezas">
            No se han identificado piezas concretas para reemplazar. Se recomienda revisión profesional.
          </p>
        }

        @if (r.unresolvedPartNames.length > 0) {
          <aside class="aviso">
            <strong>Aviso:</strong> el asistente sugirió piezas que no figuran en nuestro
            catálogo y han sido descartadas
            ({{ r.unresolvedPartNames.join(', ') }}).
          </aside>
        }

        <button type="button" class="boton-volver" (click)="volverAHome()">
          Hacer otro diagnóstico
        </button>

        <button type="button" class="boton-aceptar" (click)="aceptarDiagnostico()" [disabled]="savingIssue()">
          {{ savingIssue() ? 'Guardando diagnóstico...' : 'Aceptar diagnóstico y elegir taller' }}
        </button>
      }
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .diagnostico-page {
        max-width: 960px;
        margin: 0 auto;
        padding: 1.5rem;
      }
      .estado { padding: 2rem; text-align: center; }
      .estado--error { color: #b00020; }
      .estado--success {
        color: #1f5e24;
        background: #e8f5e9;
        border: 1px solid #a5d6a7;
        border-radius: 0.4rem;
        margin-bottom: 1rem;
        padding: 0.75rem 1rem;
      }
      .cabecera h1 { margin: 0 0 0.5rem; }
      .diagnosis { font-size: 1.15rem; font-weight: 600; margin: 0 0 1rem; }
      .confidence {
        display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;
      }
      .confidence__bar {
        flex: 1; height: 0.6rem; background: #eee; border-radius: 0.3rem; overflow: hidden;
      }
      .confidence__fill { height: 100%; background: #2e7d32; transition: width 0.4s; }
      .explanation { color: #444; line-height: 1.5; }
      .piezas { list-style: none; padding: 0; display: grid; gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
      .pieza {
        border: 1px solid #ddd; border-radius: 0.5rem; padding: 1rem;
        display: flex; flex-direction: column; gap: 0.75rem; background: #fff;
      }
      .pieza img {
        width: 100%; height: 160px; object-fit: cover; border-radius: 0.35rem; background: #f5f5f5;
      }
      .pieza__info h3 { margin: 0 0 0.25rem; font-size: 1rem; }
      .pieza__info p { margin: 0; font-size: 0.9rem; color: #555; }
      .pieza__precio { font-weight: 600; color: #1565c0; }
      .sin-piezas { color: #555; font-style: italic; }
      .aviso {
        margin-top: 1.5rem; padding: 0.75rem 1rem;
        background: #fff8e1; border-left: 4px solid #f9a825; border-radius: 0.25rem;
        font-size: 0.9rem;
      }
      .boton-volver {
        margin-top: 2rem; padding: 0.6rem 1.2rem;
        background: #1565c0; color: white; border: none; border-radius: 0.3rem;
        cursor: pointer; font-size: 1rem;
      }
      .boton-volver:hover { background: #0d47a1; }
      .boton-aceptar {
        margin-top: 0.75rem; margin-left: 0.75rem; padding: 0.6rem 1.2rem;
        background: #2e7d32; color: white; border: none; border-radius: 0.3rem;
        cursor: pointer; font-size: 1rem;
      }
      .boton-aceptar:hover { background: #1f5e24; }
      .boton-aceptar:disabled { opacity: 0.7; cursor: not-allowed; }
    `,
  ],
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
