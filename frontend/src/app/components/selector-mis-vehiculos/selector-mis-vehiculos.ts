import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalVehicleResponse } from '../../services/api.models';

@Component({
  selector: 'app-selector-mis-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-mis-vehiculos.html',
  styleUrl: './selector-mis-vehiculos.css',
})
export class SelectorMisVehiculos {
  @Input() vehicles: PersonalVehicleResponse[] = [];
  @Input() selectedId: number | null = null;
  @Output() selectionChange = new EventEmitter<number | null>();

  displayName(v: PersonalVehicleResponse): string {
    const parts = [v.brand, v.vehicleName, v.modelName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : `Vehículo #${v.id}`;
  }

  onChange(id: number | null): void {
    this.selectionChange.emit(id);
  }
}
