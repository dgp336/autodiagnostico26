import { isPlatformBrowser, } from '@angular/common';

import { Component, ViewChild, inject, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatApiService } from '../../services/chat-api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { MechanicService } from '../../services/mechanic.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-seguimiento-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatStepperModule, MatButtonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.css'
})

export class SeguimientoComponent implements OnInit {
  // Flag indicating if the current user is a mechanic. Determines if steps are editable.
  isMechanic: boolean = false;
  private readonly mechanicService = inject(MechanicService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('stepper') stepper!: MatStepper;

  participantId = 0;
  sessionUuid = '';
  tracking: any = null;
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
    this.isMechanic = role === 'TALLER';
    const userId = this.authStateService.userId();

    if (!userId) {
      return;
    }

    this.participantId = userId;
    this.issueStatus = this.tracking?.status ?? '';

    this.loadTracking();

    // if (!this.isMechanic) {
    //   // Remove click behavior on step headers
    //   const stepHeaders = this.stepper._stepHeader;
    //   stepHeaders.forEach((header: any) => {
    //     header._elementRef.nativeElement.style.pointerEvents = 'none';
    //   });
    // }
  }

  ngAfterViewInit = () => {
    if (!this.isMechanic) {
      // Remove click behavior on step headers
      const stepHeaders = this.stepper._stepHeader;
      stepHeaders.forEach((header: any) => {
        header._elementRef.nativeElement.style.pointerEvents = 'none';
      });
    }
  }
  loadTracking(): void {

    this.mechanicService
      .getTrackingForClient(this.participantId)
      .subscribe({

        next: (tracking) => {
          if (!tracking) {

            this.hasTracking = false;
            this.cdr.detectChanges();
            return;
          }
          this.hasTracking = true;
          this.tracking = tracking;

          this.sessionUuid = tracking.sessionUuid ?? '';
          localStorage.setItem(
            'trackingSessionUuid',
            this.sessionUuid
          );
          this.cdr.detectChanges();
          console.log('USER TRACKING', tracking);
          console.log('USER UUID', this.sessionUuid);

          this.cdr.detectChanges();

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
        this.hasTracking = true;
        this.tracking = tracking;

        this.sessionUuid = tracking.sessionUuid ?? '';
        localStorage.setItem(
          'trackingSessionUuid',
          this.sessionUuid
         );
        this.cdr.detectChanges();
        console.log('USER TRACKING', tracking);
        console.log('USER UUID', this.sessionUuid);

        this.cdr.detectChanges();

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

  this.chatApiService
    .isUserOnline(this.sessionUuid, this.participantId)
    .subscribe({
      next: (isOnline) => {
        this.userOnline = isOnline;
        this.cdr.detectChanges();
      }
    });

  this.chatApiService
    .unreadCount(this.sessionUuid)
    .subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      }
    });
}

}
