import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ChatApiService } from '../../services/chat-api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { MechanicService, MechanicClient } from '../../services/mechanic.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-seguimiento-page',
  standalone: true,
  imports: [RouterOutlet, MatStepperModule, MatButtonModule, ReactiveFormsModule, FormsModule, DatePipe],
  providers: [DatePipe],
  templateUrl: './seguimiento.html',
  styleUrls: ['./seguimiento.css']
})

export class SeguimientoComponent implements OnInit {
  canEditTracking: boolean = false;
  private readonly mechanicService = inject(MechanicService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('stepper') stepper!: MatStepper;

  participantId = 0;
  sessionUuid = '';
  tracking: MechanicClient | null = null;
  hasTracking = false;
  userOnline = false;
  unreadCount = 0;
  issueStatus: string = '';

  constructor(
    private readonly chatApiService: ChatApiService,
    private readonly authStateService: AuthStateService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }
  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)
      || !this.authStateService.canAccessSeguimiento()) {
      return;
    }

    const role = this.authStateService.role();
    this.canEditTracking = role === 'TALLER' || role === 'ADMIN';
    const userId = this.authStateService.userId();

    if (!userId) {
      return;
    }

    this.participantId = userId;
    this.issueStatus = this.tracking?.status ?? '';

    this.loadTracking();
  }

  ngAfterViewInit(): void {
    if (this.canEditTracking) {
      return;
    }

    queueMicrotask(() => {
      const stepHeaders = this.stepper?._stepHeader ?? [];

      stepHeaders.forEach((header: any) => {
        const element = header?._elementRef?.nativeElement;

        if (!element) {
          return;
        }

        element.style.pointerEvents = 'none';
        element.tabIndex = -1;
        element.setAttribute('aria-disabled', 'true');
      });
    });
  }
  loadTracking(): void {
    this.mechanicService.getTrackingForClient(this.participantId).subscribe({
      next: (tracking) => {
        if (!tracking) {
          this.hasTracking = false;
          this.cdr.detectChanges();
          return;
        }

        this.hasTracking = true;
        this.tracking = tracking as MechanicClient;
        this.issueStatus = this.tracking?.status ?? '';

        this.sessionUuid = this.tracking?.sessionUuid ?? '';
        localStorage.setItem('trackingSessionUuid', this.sessionUuid);

        this.cdr.detectChanges();

        console.log('USER TRACKING', tracking);
        console.log('USER UUID', this.sessionUuid);

        setTimeout(() => {
          this.router.navigate(['/usuario/seguimiento/chat']);
        });
      },
      error: (err) => {
        if (err.status !== 404) {
          console.error(err);
        }

        this.hasTracking = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/usuario/seguimiento']);
        });
      }
    });
  }

  loadChatData(): void {
    this.chatApiService.isUserOnline(this.sessionUuid, this.participantId).subscribe({
      next: (isOnline) => {
        this.userOnline = isOnline;
        this.cdr.detectChanges();
      }
    });

    this.chatApiService.unreadCount(this.sessionUuid).subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      }
    });
  }
}