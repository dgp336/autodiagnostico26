import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { VehicleApiService } from '../../services/vehicle-api.service';
import {
  VehicleModelSummary,
  VehicleVariant,
  VehicleSearchContext,
  EngineType,
  TransmissionType,
} from '../../services/api.models';
import { SelectorMarcaModelo } from '../selector-marca-modelo/selector-marca-modelo';
import { PrecisionBusqueda } from '../precision-busqueda/precision-busqueda';
import { DetalleVehiculo, DetalleVehiculoValue, EnumOption } from '../detalle-vehiculo/detalle-vehiculo';

export type IntroducirVehiculoMode = 'diagnostico' | 'alta';

export interface GuardarCochePayload {
  vehicleModelId: number;
  plate: string | null;
  vin: string | null;
  buildDate: string | null;
}

@Component({
  selector: 'app-introducir-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorMarcaModelo, PrecisionBusqueda, DetalleVehiculo],
  templateUrl: './introducir-vehiculo.html',
  styleUrl: './introducir-vehiculo.css',
})
export class IntroducirVehiculo implements OnInit, OnDestroy, OnChanges {
  @Input() tieneProblema = false;
  @Input() mode: IntroducirVehiculoMode = 'diagnostico';
  @Input() prefill: VehicleSearchContext | null = null;
  @Output() vehicleContextChange = new EventEmitter<VehicleSearchContext>();
  @Output() enviar = new EventEmitter<void>();
  @Output() guardarCoche = new EventEmitter<GuardarCochePayload>();

  brands: string[] = [];
  models: VehicleModelSummary[] = [];
  variants: VehicleVariant[] = [];

  loadingBrands = false;
  loadingModels = false;
  loadingVariants = false;

  selectedBrand: string | null = null;
  selectedModelId: number | null = null;
  detailValue: DetalleVehiculoValue = { variantId: null, year: null, engineType: null, transmission: null };

  plate = '';
  vin = '';
  buildDate = '';
  saving = false;

  readonly engineTypeOptions: EnumOption<EngineType>[] = [
    { value: 'PETROL', label: 'Gasolina' },
    { value: 'DIESEL', label: 'Diésel' },
    { value: 'BEV', label: 'Eléctrico (BEV)' },
    { value: 'HEV', label: 'Híbrido (HEV)' },
    { value: 'PHEV', label: 'Híbrido enchufable (PHEV)' },
    { value: 'REEV', label: 'Eléctrico con autonomía extendida (REEV)' },
  ];

  readonly transmissionOptions: EnumOption<TransmissionType>[] = [
    { value: 'MT', label: 'Manual (MT)' },
    { value: 'AT', label: 'Automático (AT)' },
    { value: 'CVT', label: 'Variador continuo (CVT)' },
    { value: 'iMT', label: 'Manual inteligente (iMT)' },
    { value: 'DCT', label: 'Doble embrague (DCT)' },
    { value: 'eCVT', label: 'Variador electrónico (eCVT)' },
    { value: 'DSG', label: 'DSG (VAG)' },
  ];

  private readonly precisionLabels = [
    'Sin información del vehículo',
    'Orientación muy básica',
    'Diagnóstico aproximado',
    'Diagnóstico probable',
    'Diagnóstico de precisión',
  ];

  private readonly pw = {
    engineType: 30,
    year: 25,
    model: 20,
    variant: 12,
    transmission: 8,
    brand: 5,
  };

  private destroy$ = new Subject<void>();

  constructor(private vehicleApi: VehicleApiService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prefill'] && this.prefill) {
      void this.applyPrefill(this.prefill);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get detailDisabled(): boolean {
    return !this.selectedModelId;
  }

  get canSubmitDiagnostico(): boolean {
    return this.tieneProblema && !!this.selectedBrand && !!this.selectedModelId;
  }

  get canSubmitAlta(): boolean {
    return !!this.selectedBrand && !!this.selectedModelId && !!this.detailValue.variantId && !this.saving;
  }

  get precisionLevel(): number {
    let s = 0;
    if (this.selectedBrand) s += this.pw.brand;
    if (this.selectedModelId) s += this.pw.model;
    if (this.detailValue.engineType) s += this.pw.engineType;
    if (this.detailValue.year) s += this.pw.year;
    if (this.detailValue.variantId) s += this.pw.variant;
    if (this.detailValue.transmission) s += this.pw.transmission;
    if (s === 0) return 0;
    if (s <= 20) return 1;
    if (s <= 50) return 2;
    if (s <= 80) return 3;
    return 4;
  }

  get precisionLabel(): string {
    return this.precisionLabels[this.precisionLevel];
  }

  onBrandChange(brand: string | null): void {
    this.selectedBrand = brand;
    this.models = [];
    this.variants = [];
    this.selectedModelId = null;

    if (brand) {
      this.loadingModels = true;
      this.vehicleApi.getModels(brand).pipe(takeUntil(this.destroy$)).subscribe({
        next: (models: VehicleModelSummary[]) => { this.models = models; this.loadingModels = false; },
        error: () => { this.loadingModels = false; },
      });
    }
    this.emitContext();
  }

  onModelChange(modelId: number | null): void {
    this.selectedModelId = modelId;
    this.variants = [];

    if (modelId) {
      this.loadingVariants = true;
      this.vehicleApi.getVariants(modelId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (variants: VehicleVariant[]) => { this.variants = variants; this.loadingVariants = false; },
        error: () => { this.loadingVariants = false; },
      });
    }
    this.emitContext();
  }

  onDetailChange(value: DetalleVehiculoValue): void {
    this.detailValue = value;
    this.emitContext();
  }

  onClickGuardarCoche(): void {
    if (!this.canSubmitAlta || this.detailValue.variantId === null) {
      return;
    }
    this.saving = true;
    this.guardarCoche.emit({
      vehicleModelId: this.detailValue.variantId,
      plate: this.plate.trim() || null,
      vin: this.vin.trim() || null,
      buildDate: this.buildDate || null,
    });
  }

  resetForm(): void {
    this.selectedBrand = null;
    this.selectedModelId = null;
    this.models = [];
    this.variants = [];
    this.detailValue = { variantId: null, year: null, engineType: null, transmission: null };
    this.plate = '';
    this.vin = '';
    this.buildDate = '';
    this.saving = false;
    this.emitContext();
  }

  notifySaved(): void {
    this.saving = false;
    this.resetForm();
  }

  notifySaveFailed(): void {
    this.saving = false;
  }

  private loadBrands(): void {
    this.loadingBrands = true;
    queueMicrotask(() => {
      this.vehicleApi
        .getBrands()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (brands: string[]) => {
            this.brands = brands;
            setTimeout(() => { this.loadingBrands = false; });
          },
          error: () => {
            setTimeout(() => { this.loadingBrands = false; });
          },
        });
    });
  }

  private async applyPrefill(ctx: VehicleSearchContext): Promise<void> {
    if (!ctx.brand) {
      return;
    }
    this.selectedBrand = ctx.brand;

    try {
      const models = await firstValueFrom(this.vehicleApi.getModels(ctx.brand));
      this.models = models;
      if (ctx.modelId) {
        this.selectedModelId = ctx.modelId;
        const variants = await firstValueFrom(this.vehicleApi.getVariants(ctx.modelId));
        this.variants = variants;
        this.detailValue = {
          variantId: ctx.variantId,
          year: ctx.year,
          engineType: ctx.engineType,
          transmission: ctx.transmission,
        };
      }
    } catch {
      // silencioso: el usuario puede continuar manualmente
    }
    this.emitContext();
  }

  private emitContext(): void {
    const modelName = this.models.find(m => m.id === this.selectedModelId)?.name ?? null;
    const variantName = this.variants.find(v => v.id === this.detailValue.variantId)?.modelName ?? null;
    this.vehicleContextChange.emit({
      brand: this.selectedBrand,
      modelId: this.selectedModelId,
      modelName,
      variantId: this.detailValue.variantId,
      variantName,
      engineType: this.detailValue.engineType,
      transmission: this.detailValue.transmission,
      year: this.detailValue.year,
    });
  }
}
