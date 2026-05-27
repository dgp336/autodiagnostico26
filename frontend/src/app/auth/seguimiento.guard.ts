import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const seguimientoGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  if (!authStateService.canAccessSeguimiento()) {
    return router.createUrlTree(['/home']);
  }

  const isMechanicRoute = state.url.startsWith('/mecanico/seguimiento');
  if (isMechanicRoute) {
    const sessionUuid = route.queryParamMap.get('sessionUuid');
    if (!sessionUuid) {
      return router.createUrlTree(['/mecanico']);
    }
  }

  return true;
};
