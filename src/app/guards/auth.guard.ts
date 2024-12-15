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
    const offlineSession = await this.storageSrv.get('sesion'); // Await the get method
    if (offlineSession === null) {
      this.router.navigate(['/iniciar-sesion']);
      return false;
    } else if (offlineSession){
      return true;
    }
    const isAuthenticated = await this.firebaseService.checkAndClearSession();
    if (!isAuthenticated) {
      this.router.navigate(['/iniciar-sesion']);
      return false;
    }
    return true;
  }
}