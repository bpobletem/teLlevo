import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const firebaseSrv = inject(FirebaseService);
  const router = inject(Router);
  if (firebaseSrv.auth.currentUser !== null) {
    return true;
  } else {
    router.navigate(['/iniciar-sesion']);
    return false; 
  }
};
