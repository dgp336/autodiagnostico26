import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { MechanicService, MechanicClient } from '../../services/mechanic.service';

@Component({
  selector: 'app-seguimiento-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './seguimiento.html',
  styleUrls: ['./seguimiento.css']
})

export class SeguimientoComponent implements OnInit {
  private readonly mechanicService = inject(MechanicService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private refreshTimerId: number | null = null;

  participantId = 0;
  trackings: MechanicClient[] = [];
  selectedTrackingId: number | null = null;
  selectedSessionUuid = '';
  hasTracking = false;

  constructor(
    private readonly authStateService: AuthStateService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }
  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)
      || !this.authStateService.canAccessSeguimiento()) {
      return;
    }

    const userId = this.authStateService.userId();

    if (!userId) {
      return;
    }

    this.participantId = userId;
    this.selectedSessionUuid = this.route.snapshot.queryParamMap.get('sessionUuid') ?? localStorage.getItem('trackingSessionUuid') ?? '';

    this.loadTrackings(false);
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadTrackings(shouldNavigateToChat = false): void {
    this.mechanicService.getTrackingsForClient(this.participantId).subscribe({
      next: (trackings) => {
        this.trackings = trackings;

        if (!trackings.length) {
          this.hasTracking = false;
          this.cdr.detectChanges();
          return;
        }

        const selected = this.resolveSelectedTracking(trackings);
        this.applySelectedTracking(selected, shouldNavigateToChat);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status !== 404) {
          console.error(err);
        }

        this.hasTracking = false;
        this.trackings = [];
        this.cdr.detectChanges();
      }
    });
  }

  selectTracking(tracking: MechanicClient): void {
    this.applySelectedTracking(tracking, true);
    this.cdr.detectChanges();
  }

  getStatusLabel(status: string): string {
    return {
      verde: 'Reparado',
      amarillo: 'Pendiente',
      naranja: 'En revisión',
      rojo: 'Urgente'
    }[status] || status;
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimerId = window.setInterval(() => {
      this.loadTrackings(false);
    }, 5000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimerId !== null) {
      window.clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private resolveSelectedTracking(trackings: MechanicClient[]): MechanicClient {
    if (this.selectedTrackingId !== null) {
      const byId = trackings.find((tracking) => tracking.issueId === this.selectedTrackingId);
      if (byId) {
        return byId;
      }
    }

    if (this.selectedSessionUuid) {
      const bySession = trackings.find((tracking) => tracking.sessionUuid === this.selectedSessionUuid);
      if (bySession) {
        return bySession;
      }
    }

    return trackings[0];
  }

  private applySelectedTracking(tracking: MechanicClient, shouldNavigateToChat = false): void {
    this.hasTracking = true;
    this.selectedTrackingId = tracking.issueId;
    this.selectedSessionUuid = tracking.sessionUuid;

    localStorage.setItem('trackingSessionUuid', tracking.sessionUuid);

    if (shouldNavigateToChat) {
      this.router.navigate(['/usuario/seguimiento/detalle'], {
        queryParams: { sessionUuid: tracking.sessionUuid }
      });
    }
  }
}