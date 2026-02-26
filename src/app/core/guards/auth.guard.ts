import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const sb = inject(SupabaseService);
  const router = inject(Router);

  // Check session directly instead of relying on signal timing
  const { data: { session } } = await sb.auth.getSession();

  if (session) {
    return true;
  }
  return router.createUrlTree(['/login']);
};