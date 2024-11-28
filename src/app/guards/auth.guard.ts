import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private firebaseService: FirebaseService, private router: Router) {}
  storageSrv = inject(StorageService);


  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const offlineSession = this.storageSrv.get('sesion');
    if (offlineSession) {
      return true; // Sesión offline válida
    }
    const isAuthenticated = await this.firebaseService.checkAndClearSession();
    if (!isAuthenticated) {
      return this.router.createUrlTree(['/iniciar-sesion']);
    }
    return true;
  }
}
