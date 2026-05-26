import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { MechanicService, MechanicClient } from '../services/mechanic.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-mecanico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mecanico.component.html',
  styleUrls: ['./mecanico.component.css']
})
export class MecanicoComponent implements OnInit, OnDestroy {
  mechanicName = 'Mecánico';
  workshopName = 'Taller';
  private mechanicService = inject(MechanicService);
  private authState = inject(AuthStateService);
  private cdr = inject(ChangeDetectorRef);

  private refreshTimerId: number | null = null;
  private mechanicId: number | null = null;

  clients: MechanicClient[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.mechanicId = this.authState.userId();
    if (!this.mechanicId) {
      this.loading = false;
      this.error = 'No se encontro un mecanico autenticado';
      return;
    }

    this.mechanicName = this.authState.userName();
    this.refreshClients();
    this.refreshTimerId = window.setInterval(() => this.refreshClients(false), 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimerId !== null) {
      window.clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private refreshClients(showLoading = true): void {
    if (!this.mechanicId) {
      return;
    }

    if (showLoading) {
      this.loading = true;
    }

    this.mechanicService.getClientsForMechanic(this.mechanicId).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.error = null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error loading clients';
        this.loading = false;
        console.error('Error loading clients:', err);
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: string): string {
    return {
      verde: 'En buen estado',
      amarillo: 'Pendiente',
      naranja: 'En revisión',
      rojo: 'Urgente'
    }[status] || status;
  }
}