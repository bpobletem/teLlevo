import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Viaje, estadoViaje, EstadoSolicitud } from 'src/app/interfaces/interfaces';
import { StorageService } from 'src/app/services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage implements OnInit {
  viajes: Viaje[] = [];
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  storageSrv = inject(StorageService);

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentUserId = await this.storageSrv.get('sesion');
      if (!currentUserId) {
        throw new Error('No user session found');
      }

      this.firebaseSrv.getCollectionChanges<Viaje>('Viajes').subscribe({
        next: (viajes) => {
          this.viajes = viajes.filter((viaje) => {
            const fechaSalida = new Date(`${viaje.fechaSalida}T00:00:00`);

            if (isNaN(fechaSalida.getTime())) {
              console.warn('Invalid fechaSalida for viaje:', viaje.fechaSalida);
              return false;
            }

            return (
              viaje.estado === estadoViaje.pendiente &&
              fechaSalida.getTime() >= today.getTime() &&
              viaje.piloto.uid !== currentUserId &&
              viaje.asientosDisponibles >= 1
            );
          });
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener los viajes:', error);
          loading.dismiss();
        },
      });
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      loading.dismiss();
    }
  }

  async solicitarUnirseAlViaje(viaje: Viaje) {
    const user = await this.storageSrv.getUserFromSesion();
    const pasajeroId = user.uid;

    if (!pasajeroId) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Solicitud de viaje',
      message: `¿Deseas solicitar unirte al viaje hacia ${viaje.destino}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.firebaseSrv.setDocument(`SolicitudesViaje/${viaje.id + pasajeroId}`, {
                viajeId: viaje.id,
                pasajeroId: pasajeroId,
                estado: EstadoSolicitud.pendiente,
              });
              this.utilsSrv.presentToast({
                message: 'Solicitud enviada exitosamente.',
                duration: 2000,
                color: 'success',
              });
              this.router.navigate(['/historial-solicitudes']);
            } catch (error) {
              console.error('Error al enviar la solicitud:', error);
              this.utilsSrv.presentToast({
                message: 'Error al enviar la solicitud.',
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
