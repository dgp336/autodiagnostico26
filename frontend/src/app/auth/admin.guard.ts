import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const adminGuard: CanActivateFn = () => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  if (authStateService.isLoggedIn() && authStateService.role() === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/login']);
};