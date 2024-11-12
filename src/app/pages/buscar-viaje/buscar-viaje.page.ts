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
    if (viaje.id) { // Verificación de existencia de ID antes de navegar
      const navigationExtras: NavigationExtras = { state: { viaje: viaje } };
      this.router.navigate(['/detalle-viaje'], navigationExtras);
    } else {
      console.error('No se pudo encontrar el ID del viaje');
    }
  }

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
  
      this.firebaseSrv.getCollectionChanges<Viaje>('Viajes').subscribe({
        next: (viajes) => {
          this.viajes = viajes.filter(viaje => {
            const fechaSalida = new Date(viaje.fechaSalida);
            return viaje.estado === estadoViaje.pendiente && 
                   fechaSalida >= today;
          });
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener los viajes:', error);
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      loading.dismiss();
    }
  }
}
