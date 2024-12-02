import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoSolicitud, SolicitudesViaje, Usuario, Viaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-historial-solicitudes',
  templateUrl: './historial-solicitudes.page.html',
  styleUrls: ['./historial-solicitudes.page.scss'],
})
export class HistorialSolicitudesPage implements OnInit {

  solicitudesViaje = [];
  userId: string = '';

  firebaseSrv = inject(FirebaseService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  utilsSrv = inject(UtilsService);
  storageSrv = inject(StorageService);

  constructor() { }

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
  
    try {
      const user = await this.storageSrv.getUserFromSesion();
      if (!user) {
        throw new Error('User not found in session');
      }
      this.userId = user.uid;
      console.log('User ID:', this.userId);
  
      this.firebaseSrv.getCollectionChanges<SolicitudesViaje>('SolicitudesViaje').subscribe({
        next: async (solicitudes) => {
          console.log('Current solicitudesViaje:', solicitudes);
          const filteredSolicitudes = solicitudes.filter(solicitud => solicitud.pasajeroId === this.userId);
          console.log('Filtered solicitudes:', filteredSolicitudes);
  
          const solicitudPromises = filteredSolicitudes.map(async (solicitud) => {
            const viaje = await this.firebaseSrv.getDocument(`Viajes/${solicitud.viajeId}`) as Viaje;
            if (!viaje) {
              console.error(`Viaje not found for ID: ${solicitud.viajeId}`);
              return solicitud;
            }
            const piloto = await this.firebaseSrv.getDocument(`Usuario/${viaje.piloto['uid']}`) as Usuario;
            if (!piloto) {
              console.error(`Piloto not found for UID: ${viaje.piloto['uid']}`);
              return solicitud;
            }
            solicitud.viaje = viaje;
            solicitud.piloto = piloto;
            return solicitud;
          });
  
          this.solicitudesViaje = await Promise.all(solicitudPromises);
          console.log('Solicitudes with additional data:', this.solicitudesViaje);
        },
        error: (error) => {
          console.error('Error fetching solicitudesViaje:', error);
        }
      });
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    } finally {
      loading.dismiss();
    }
  }

  getColorByEstado(estado: string): string {
    switch (estado) {
      case EstadoSolicitud.pendiente:
        return 'warning';
      case EstadoSolicitud.aprobado:
        return 'success';
      case EstadoSolicitud.rechazado:
        return 'danger';
      default:
        return 'medium';
    }
  }

}
