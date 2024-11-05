import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const firebaseSrv = inject(FirebaseService);
  const router = inject(Router);
  const localStorageSrv = inject(StorageService)

  const user = localStorageSrv.get(firebaseSrv.auth.currentUser.uid)
  console.log(firebaseSrv.auth.currentUser)
  console.log(user)

  return new Promise((resolve) => {
    firebaseSrv.auth.onAuthStateChanged((auth) => {
      if (auth && user) {
        resolve(true)
      } else {
        router.navigate(['/iniciar-sesion'])
        resolve(false)
      }
    })
  })  
};
