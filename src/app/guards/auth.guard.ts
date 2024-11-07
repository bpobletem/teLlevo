import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const firebaseSrv = inject(FirebaseService);
  const router = inject(Router);
  const storageSrv = inject(StorageService);

  try {
    const userUid = await storageSrv.get('sesion'); // Espera la promesa para obtener el userUid
    console.log(userUid);
    console.log(firebaseSrv.auth.currentUser);

    if (firebaseSrv.auth.currentUser !== null) {
      const uid = firebaseSrv.auth.currentUser.uid;
      if (uid === userUid) {
        return true;
      }
    }
    await router.navigate(['/iniciar-sesion']);
    return false;
  } catch (error) {
    console.error('Error obteniendo el UID del usuario:', error);
    await router.navigate(['/iniciar-sesion']);
    return false;
  }
};
