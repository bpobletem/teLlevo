import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Viaje, estadoViaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage {

  viajes = [];
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);

  constructor(private router: Router) { }

  unirseAlViaje(trip: any) {
    this.router.navigate(['/viaje-en-curso'], { state: { trip } });
  }

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
    try {
      this.firebaseSrv.getCollectionChanges<Viaje>('Viajes').subscribe((viaje) => {
        this.viajes = viaje.filter((viaje) => viaje.estado === estadoViaje.pendiente);
        loading.dismiss();
      }, (error) => {
        console.error('Error al obtener los viajes:', error);
        loading.dismiss();
      });
    } catch (error) {
      console.error('Error al inicializar:', error);
      loading.dismiss();
    }
  }
}
