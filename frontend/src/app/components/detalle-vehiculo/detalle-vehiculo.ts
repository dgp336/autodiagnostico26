import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { VehicleVariant, EngineType, TransmissionType } from '../../services/api.models';

export interface DetalleVehiculoValue {
  variantId: number | null;
  year: number | null;
  engineType: EngineType | null;
  transmission: TransmissionType | null;
}

export interface EnumOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-detalle-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detalle-vehiculo.html',
  styleUrl: './detalle-vehiculo.css',
})
export class DetalleVehiculo implements OnInit, OnChanges, OnDestroy {
  @Input() variants: VehicleVariant[] = [];
  @Input() loadingVariants = false;
  @Input() disabled = false;
  @Input() engineTypeOptions: EnumOption<EngineType>[] = [];
  @Input() transmissionOptions: EnumOption<TransmissionType>[] = [];
  filteredTransmissionOptions: EnumOption<TransmissionType>[] = [];
  @Input() value: DetalleVehiculoValue | null = null;

  @Output() detailChange = new EventEmitter<DetalleVehiculoValue>();

  form!: FormGroup;
  readonly currentYear = new Date().getFullYear();

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      variantId: [{ value: null, disabled: this.disabled }],
      year: [null],
      engineType: [null],
      transmission: [null],
    });
    this.updateTransmissionOptions();

    this.form.get('variantId')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(variantId => {
      const variant = variantId ? this.variants.find(v => v.id === Number(variantId)) : null;
      this.form.get('engineType')!.setValue(variant?.engineType ?? null, { emitEvent: false });
      this.form.get('transmission')!.setValue(variant?.transmission ?? null, { emitEvent: false });
      this.updateTransmissionOptions();
    });
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.emitValue();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) return;

    if (changes['disabled']) {
      const variantCtrl = this.form.get('variantId')!;
      if (this.disabled) {
        variantCtrl.disable({ emitEvent: false });
        this.form.reset({ variantId: null, year: null, engineType: null, transmission: null }, { emitEvent: false });
      } else {
        variantCtrl.enable({ emitEvent: false });
      }
    }

    if (changes['variants'] && this.variants.length === 0) {
      this.form.patchValue({
        variantId: null,
        year: null,
        engineType: null,
        transmission: null,
      }, { emitEvent: false });
    }

    if (changes['value']) {
      if (this.value) {
        this.form.patchValue(this.value, { emitEvent: false });
      } else {
        this.form.reset({ variantId: null, year: null, engineType: null, transmission: null }, { emitEvent: false });
      }
    }
    if (changes['transmissionOptions'] && this.variants && this.form) {
      const variantId = this.form.get('variantId')?.value;
      const variant = variantId ? this.variants.find(v => v.id === Number(variantId)) : null;
      this.updateTransmissionOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTransmissionOptions(): void {
    const availableTransmissions = new Set<TransmissionType>();
    this.variants?.forEach(v => {
      if (v?.transmission != null) {
        availableTransmissions.add(v.transmission);
      }
    });
    if (availableTransmissions.size > 0) {
      this.filteredTransmissionOptions = this.transmissionOptions.filter(opt =>
        availableTransmissions.has(opt.value as unknown as TransmissionType)
      );
    } else {
      this.filteredTransmissionOptions = [...this.transmissionOptions];
    }
  }

  private emitValue(): void {
    const raw = this.form.getRawValue();
    this.detailChange.emit({
      variantId: raw.variantId ? Number(raw.variantId) : null,
      year: raw.year ? Number(raw.year) : null,
      engineType: raw.engineType || null,
      transmission: raw.transmission || null,
    });
  }
}
