import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { EstadoSolicitud, SolicitudesViaje } from 'src/app/interfaces/interfaces';
import { MapService } from 'src/app/services/map.service';
import { FieldValue, arrayUnion } from 'firebase/firestore';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-solicitudes-viaje',
  templateUrl: './solicitudes-de-viaje.page.html',
  styleUrls: ['./solicitudes-de-viaje.page.scss'],
})
export class SolicitudesDeViajePage implements OnInit {
  viajeId: string = '';
  solicitudes: SolicitudesViaje[] = [];
  viaje: any;
  utilsSrv = inject(UtilsService);

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
    private mapService: MapService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation()?.extras.state;
    if (navigation && navigation['viajeId']) {
      this.viajeId = navigation['viajeId'];
      console.log('Viaje ID recibido en SolicitudesDeViajePage:', this.viajeId);
      this.cargarSolicitudes();
      this.cargarViajeDetalles();
    } else {
      console.error('No se recibió el viajeId en NavigationExtras');
    }
  }

  cargarSolicitudes() {
    this.firebaseSrv.getCollectionChanges<SolicitudesViaje>('SolicitudesViaje').subscribe((solicitudes) => {
      this.solicitudes = solicitudes.filter(solicitud => 
        solicitud.viajeId === this.viajeId && solicitud.estado === 'pendiente'
      );
    });
  }

  async cargarViajeDetalles() {
    try {
      const viajeSnapshot = await this.firebaseSrv.getDocument(`Viajes/${this.viajeId}`);
      if (viajeSnapshot) {
        this.viaje = viajeSnapshot;
        console.log('Detalles del viaje cargados:', this.viaje);
      } else {
        console.error('Error: No se encontraron detalles del viaje.');
      }
    } catch (error) {
      console.error('Error al cargar detalles del viaje:', error);
    }
  }

  async aceptarSolicitud(solicitud: SolicitudesViaje) {
    try {
      // Get coordinates for the stop
      const coords = await this.mapService.getCoordsFromAddress(solicitud.parada);
      if (!coords) {
        throw new Error('Invalid coordinates for the given address');
      }
  
      console.log('Adding stop coordinates:', coords);
  
      // Add the stop to the map and update Firebase
      await this.mapService.addStop(coords, this.viajeId);
  
      // Update the state of the solicitud to approved
      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, {
        estado: EstadoSolicitud.aprobado,
      });
  
      // Add the stop to the rutas field in Viajes
      await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
        rutas: arrayUnion({ lng: coords[0], lat: coords[1] }),
        pasajeros: arrayUnion(solicitud.pasajeroId), // Add the passenger to the trip
      });
  
      console.log(`Solicitud for pasajero ${solicitud.pasajeroId} accepted and updated.`);
    } catch (error) {
      console.error('Error accepting solicitud:', error);
    }
  }
  

  async rechazarSolicitud(solicitud: SolicitudesViaje) {
    try {
      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, { estado: 'rechazado' });
      this.solicitudes = this.solicitudes.filter(s => s !== solicitud);
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
    }
  }

 async iniciarViaje() {
    setTimeout(() => {
      const navigationExtras: NavigationExtras = { state: { viajeId: this.viajeId } };
      this.router.navigate(['/viaje-en-curso'], navigationExtras);
    }, 2000); // Delay to allow Firebase to sync

    await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
      estado: this.viaje.estadoViaje.enCurso
    });
  }
  
  async cancelarViaje() {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro que deseas cancelar este viaje?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            const loading = await this.utilsSrv.loading();
            await loading.present();
  
            try {
              await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
                estado: 'cancelado'
              });
  
              this.utilsSrv.presentToast({
                message: 'Viaje cancelado exitosamente',
                duration: 2000,
                color: 'primary',
                position: 'bottom'
              });
  
              this.router.navigate(['/historial-viajes']);
            } catch (error) {
              console.error('Error al cancelar el viaje:', error);
              this.utilsSrv.presentToast({
                message: 'Error al cancelar el viaje',
                duration: 2000,
                color: 'danger',
                position: 'bottom'
              });
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
}
