import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoSolicitud, SolicitudesViaje, Usuario, Viaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
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

  constructor() { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state && state['userId']) {
        this.userId = state['userId'];
        console.log('UserId from state:', this.userId);

        this.firebaseSrv.getCollectionChanges<SolicitudesViaje>('SolicitudesViaje').subscribe({
          next: async (solicitudes) => {
            console.log('Current solicitudesViaje:', solicitudes);
            // Filtrar solicitudes por id
            const filteredSolicitudes = solicitudes.filter(solicitud => solicitud.pasajeroId === this.userId);
            // Obtener info adicional de cada solicitud
            for (const solicitud of filteredSolicitudes) {
              const viaje = await this.firebaseSrv.getDocument(`Viajes/${solicitud.viajeId}`) as Viaje;
              const piloto = await this.firebaseSrv.getDocument(`Usuario/${viaje.piloto['uid']}`) as Usuario;
              solicitud.viaje = viaje;
              solicitud.piloto = piloto;
            }

            this.solicitudesViaje = filteredSolicitudes;
            console.log('Solicitudes with additional data:', this.solicitudesViaje);
          },
          error: (error) => console.error('Error fetching solicitudesViaje:', error)
        });
      } else {
        console.error('No userId found in navigation state');
      }
    });
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
