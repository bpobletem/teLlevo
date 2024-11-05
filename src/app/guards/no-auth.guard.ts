import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { StorageService } from '../services/storage.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const firebaseSrv = inject(FirebaseService);
  const router = inject(Router);

  return new Promise((resolve) => {
    firebaseSrv.auth.onAuthStateChanged((auth) => {
      if (!auth) {
        resolve(true)
      } else {
        router.navigate(['/home'])
        resolve(false)
      }
    })
  })  
};
