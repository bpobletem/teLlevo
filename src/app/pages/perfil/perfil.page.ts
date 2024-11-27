import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  firebaseSrv = inject(FirebaseService);
  storageSrv = inject(StorageService);
  utilsSrv = inject(UtilsService);

  currentUser: Usuario;

  constructor(private router: Router) {}

  signOut() {
    this.firebaseSrv.signOut();
    this.utilsSrv.presentToast({
      message: "Sesión cerrada con éxito",
      duration: 2500,
      color: 'primary',
      position: 'bottom',
      icon: 'alert-circle-outline'
    })
  }

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.loadUser();
  }

  goToHistorialSolicitudes() {
    if (this.currentUser) {
      const navigationExtras: NavigationExtras = {
        state: { userId: this.currentUser.uid }
      };
      this.router.navigate(['/historial-solicitudes'], navigationExtras);
    } else {
      console.error('No current user found');
    }
  }

  async loadUser() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
  
    const correo = await this.storageSrv.get('sesion');
    console.log('Retrieved uid from storage:', correo);
  
    if (!correo) {
      console.error('No correo found in storage');
      this.router.navigate(['/iniciar-sesion']);
      await loading.dismiss();
      return;
    }

    const user = await this.storageSrv.get(correo);
    console.log(user)
    this.currentUser = user as Usuario;
    loading.dismiss()
  }
}
