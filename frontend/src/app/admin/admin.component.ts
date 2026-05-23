import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { WorkshopService } from '../services/workshop.service';
import { WorkshopApplicationApiService } from '../services/workshop-application-api.service';
import { Workshop, WorkshopApplicationResponse } from '../services/api.models';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="admin-shell">
      <header class="admin-hero">
        <div>
          <span class="eyebrow">Panel administrador</span>
          <h1>Inicio de validación de talleres</h1>
          <p>Aprueba solicitudes, rechaza registros incompletos y borra talleres ya registrados.</p>
        </div>
        <div class="admin-hero-card">
          <strong>{{ approvedWorkshops().length }}</strong>
          <span>talleres activos</span>
        </div>
      </header>

      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      <div class="admin-grid">
        <section class="panel">
          <div class="panel__head">
            <h2>Solicitudes pendientes</h2>
            <span>{{ pendingApplications().length }}</span>
          </div>

          @if (loadingPending()) {
            <p class="muted">Cargando solicitudes...</p>
          } @else if (pendingApplications().length === 0) {
            <p class="muted">No hay solicitudes pendientes.</p>
          } @else {
            <article class="card" *ngFor="let request of pendingApplications(); trackBy: trackByApplicationId">
              <div class="card__title-row">
                <div>
                  <h3>{{ request.workshopName }}</h3>
                  <p>{{ request.fullName }} · {{ request.email }}</p>
                </div>
                <span class="status status--pending">Pendiente</span>
              </div>
              <dl>
                <div><dt>Dirección</dt><dd>{{ request.address }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ request.phone }}</dd></div>
                <div><dt>Horario</dt><dd>{{ request.schedule }}</dd></div>
                <div><dt>Límite</dt><dd>{{ request.vehicleLimit }}</dd></div>
              </dl>
              <div class="actions">
                <button type="button" class="btn btn-primary" (click)="approve(request)">Aceptar</button>
                <button type="button" class="btn btn-secondary" (click)="reject(request)">Denegar</button>
              </div>
            </article>
          }
        </section>

        <section class="panel">
          <div class="panel__head">
            <h2>Talleres registrados</h2>
            <span>{{ approvedWorkshops().length }}</span>
          </div>

          @if (loadingWorkshops()) {
            <p class="muted">Cargando talleres...</p>
          } @else if (approvedWorkshops().length === 0) {
            <p class="muted">Todavía no hay talleres aprobados.</p>
          } @else {
            <article class="card" *ngFor="let workshop of approvedWorkshops(); trackBy: trackByWorkshopId">
              <div class="card__title-row">
                <div>
                  <h3>{{ workshop.name }}</h3>
                  <p>{{ workshop.mechanicName }}</p>
                </div>
                <span class="status status--approved">Aprobado</span>
              </div>
              <dl>
                <div><dt>Dirección</dt><dd>{{ workshop.address }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ workshop.phone }}</dd></div>
                <div><dt>Horario</dt><dd>{{ workshop.schedule }}</dd></div>
                <div><dt>Capacidad</dt><dd>{{ workshop.activeVehicles }} / {{ workshop.vehicleLimit }}</dd></div>
              </dl>
              <div class="actions">
                <button type="button" class="btn btn-danger" (click)="deleteWorkshop(workshop)">Eliminar</button>
              </div>
            </article>
          }
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .admin-shell {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1.25rem 3rem;
      }
      .admin-hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: linear-gradient(135deg, #0f172a, #1d4ed8);
        color: #fff;
        margin-bottom: 1.5rem;
      }
      .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; opacity: .8; }
      .admin-hero h1 { margin: .35rem 0 .5rem; font-size: clamp(1.8rem, 3vw, 3rem); }
      .admin-hero p { margin: 0; max-width: 56rem; opacity: .92; }
      .admin-hero-card {
        min-width: 140px;
        padding: 1rem 1.2rem;
        border-radius: 1rem;
        background: rgba(255,255,255,.12);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .admin-hero-card strong { font-size: 2rem; }
      .admin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
      .panel {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      }
      .panel__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
      .panel__head h2 { margin: 0; }
      .panel__head span {
        min-width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center;
        border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;
      }
      .card {
        border: 1px solid #e5e7eb;
        border-radius: .9rem;
        padding: 1rem;
        margin-bottom: .9rem;
        background: #fafafa;
      }
      .card__title-row { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
      .card h3 { margin: 0 0 .25rem; }
      .card p { margin: 0; color: #4b5563; }
      dl { margin: .85rem 0 0; display: grid; gap: .4rem; }
      dl div { display: grid; grid-template-columns: 110px 1fr; gap: .5rem; }
      dt { font-weight: 600; color: #111827; }
      dd { margin: 0; color: #374151; }
      .actions { display: flex; gap: .5rem; margin-top: 1rem; flex-wrap: wrap; }
      .btn {
        border: none; border-radius: .75rem; padding: .7rem 1rem; cursor: pointer; font-weight: 700;
      }
      .btn-primary { background: #1d4ed8; color: #fff; }
      .btn-secondary { background: #e5e7eb; color: #111827; }
      .btn-danger { background: #b91c1c; color: #fff; }
      .status { display: inline-flex; padding: .35rem .65rem; border-radius: 999px; font-size: .82rem; font-weight: 700; }
      .status--pending { background: #fef3c7; color: #92400e; }
      .status--approved { background: #dcfce7; color: #166534; }
      .muted { color: #6b7280; }
      .alert { padding: .85rem 1rem; border-radius: .8rem; margin-bottom: 1rem; }
      .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
      @media (max-width: 900px) {
        .admin-grid { grid-template-columns: 1fr; }
        .admin-hero { flex-direction: column; align-items: flex-start; }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
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