import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkshopService } from '../../services/workshop.service';
import { WorkshopApplicationApiService } from '../../services/workshop-application-api.service';
import { Workshop, WorkshopApplicationResponse } from '../../services/api.models';

@Component({
  selector: 'app-admin-gestiontaller',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-gestiontaller.html',
  styleUrls: ['./admin-gestiontaller.css'],
})
export class AdminGestionTallerComponent implements OnInit {
  private readonly workshopService = inject(WorkshopService);
  private readonly applicationService = inject(WorkshopApplicationApiService);

  readonly pendingApplications = signal<WorkshopApplicationResponse[]>([]);
  readonly approvedWorkshops = signal<Workshop[]>([]);
  readonly loadingPending = signal(true);
  readonly loadingWorkshops = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.reloadAll();
  }

  reloadAll(): void {
    this.loadPending();
    this.loadWorkshops();
  }

  loadPending(): void {
    this.loadingPending.set(true);
    this.applicationService.listPending().subscribe({
      next: (requests) => {
        this.pendingApplications.set(requests);
        this.loadingPending.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes pendientes.');
        this.loadingPending.set(false);
      },
    });
  }

  loadWorkshops(): void {
    this.loadingWorkshops.set(true);
    this.workshopService.listWorkshops().subscribe({
      next: (workshops) => {
        this.approvedWorkshops.set(workshops);
        this.loadingWorkshops.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los talleres registrados.');
        this.loadingWorkshops.set(false);
      },
    });
  }

  approve(application: WorkshopApplicationResponse): void {
    this.applicationService.approve(application.id).subscribe({
      next: () => this.reloadAll(),
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo aprobar la solicitud.'),
    });
  }

  reject(application: WorkshopApplicationResponse): void {
    this.applicationService.reject(application.id).subscribe({
      next: () => this.reloadAll(),
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo denegar la solicitud.'),
    });
  }

  deleteWorkshop(workshop: Workshop): void {
    const confirmed = window.confirm(`¿Eliminar el taller ${workshop.name}?`);
    if (!confirmed) {
      return;
    }

    this.workshopService.deleteWorkshop(workshop.id).subscribe({
      next: () => this.loadWorkshops(),
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo eliminar el taller.'),
    });
  }

  trackByApplicationId(_: number, application: WorkshopApplicationResponse): number {
    return application.id;
  }

  trackByWorkshopId(_: number, workshop: Workshop): number {
    return workshop.id;
  }
}