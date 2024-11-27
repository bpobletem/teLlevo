import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { EstadoSolicitud, estadoViaje, SolicitudesViaje, Viaje } from 'src/app/interfaces/interfaces';
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
  viaje: Viaje;
  utilsSrv = inject(UtilsService);

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
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
      this.solicitudes = solicitudes.filter(
        (solicitud) => solicitud.viajeId === this.viajeId && solicitud.estado === EstadoSolicitud.pendiente
      );
    });
  }

  async cargarViajeDetalles() {
    try {
      const viaje = await this.firebaseSrv.getDocument(`Viajes/${this.viajeId}`);
      if (viaje) {
        this.viaje = viaje as Viaje;
        console.log('Detalles del viaje cargados:', this.viaje);
      }
    } catch (error) {
      console.error('Error al cargar detalles del viaje:', error);
    }
  }

  async aceptarSolicitud(solicitud: SolicitudesViaje) {
    try {
      const viajeDoc = await this.firebaseSrv.getDocument(`Viajes/${this.viajeId}`);
      const currentAsientosDisponibles = viajeDoc['asientosDisponibles'];
      if (currentAsientosDisponibles <= 0) {
        throw new Error('No available seats');
      }
      const newAsientosDisponibles = currentAsientosDisponibles - 1;

      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, {
        estado: EstadoSolicitud.aprobado,
      });

      await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
        pasajeros: arrayUnion(solicitud.pasajeroId),
        asientosDisponibles: newAsientosDisponibles,
      });

      this.utilsSrv.presentToast({
        message: 'Solicitud aceptada con éxito',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error accepting solicitud:', error);
    }
  }

  async rechazarSolicitud(solicitud: SolicitudesViaje) {
    try {
      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, {
        estado: EstadoSolicitud.rechazado,
      });
      this.solicitudes = this.solicitudes.filter((s) => s !== solicitud);
      this.utilsSrv.presentToast({
        message: `Solicitud de ${solicitud.pasajeroId} rechazada.`,
        duration: 2000,
        color: 'warning',
      });
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
      this.utilsSrv.presentToast({
        message: 'Error al rechazar la solicitud',
        duration: 2000,
        color: 'danger',
      });
    }
  }

  async iniciarViaje() {
    try {
      await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
        estado: estadoViaje.enCurso,
      });
      const navigationExtras: NavigationExtras = { state: { viajeId: this.viajeId } };
      this.router.navigate(['/viaje-en-curso'], navigationExtras);
    } catch (error) {
      console.error('Error al iniciar el viaje:', error);
    }
  }

  async cancelarViaje() {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro que deseas cancelar este viaje?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            try {
              await this.firebaseSrv.updateDocument(`Viajes/${this.viajeId}`, {
                estado: estadoViaje.cancelado,
              });

              this.utilsSrv.presentToast({
                message: 'Viaje cancelado exitosamente',
                duration: 2000,
                color: 'primary',
              });

              this.router.navigate(['/historial-viajes']);
            } catch (error) {
              console.error('Error al cancelar el viaje:', error);
              this.utilsSrv.presentToast({
                message: 'Error al cancelar el viaje',
                duration: 2000,
                color: 'danger',
              });
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
