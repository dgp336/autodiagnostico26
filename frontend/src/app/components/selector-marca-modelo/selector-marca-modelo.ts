import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleModelSummary } from '../../services/api.models';

@Component({
  selector: 'app-selector-marca-modelo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-marca-modelo.html',
  styleUrl: './selector-marca-modelo.css',
})
export class SelectorMarcaModelo implements OnChanges {
  @Input() brands: string[] = [];
  @Input() models: VehicleModelSummary[] = [];
  @Input() loadingBrands = false;
  @Input() loadingModels = false;
  @Input() selectedBrand: string | null = null;
  @Input() selectedModelId: number | null = null;

  @Output() brandChange = new EventEmitter<string | null>();
  @Output() modelChange = new EventEmitter<number | null>();

  get modelsDisabled(): boolean {
    return !this.selectedBrand || this.loadingModels;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si la lista de modelos se vacía (cambio de marca), resetear modelo
    if (changes['models'] && this.models.length === 0) {
      queueMicrotask(() => {
        this.selectedModelId = null;
      });   
   }
  }

  onBrandChange(value: string): void {
    this.selectedBrand = value || null;
    this.selectedModelId = null;
    this.brandChange.emit(this.selectedBrand);
    this.modelChange.emit(null);
  }

  onModelChange(value: string): void {
    this.selectedModelId = value ? Number(value) : null;
    this.modelChange.emit(this.selectedModelId);
  }
}
