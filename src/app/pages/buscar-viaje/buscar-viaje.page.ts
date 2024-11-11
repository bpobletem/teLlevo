import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Viaje, estadoViaje } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage implements OnInit {

  viajes: Viaje[] = [];
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);

  constructor(private router: Router) { }

  unirseAlViaje(viaje: Viaje) {
    const navigationExtras: NavigationExtras = { state: { viaje: viaje } };
    console.log(navigationExtras)
    this.router.navigate(['/detalle-viaje'], navigationExtras);
  }

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
    try {
      this.firebaseSrv.getCollectionChanges<Viaje>('Viajes').subscribe((viaje) => {
        this.viajes = viaje.filter((viaje) => viaje.estado === estadoViaje.pendiente);
      });
    } catch (error) {
      console.error('Error al obtener los autos:', error);
    }
    loading.dismiss();
  }
}