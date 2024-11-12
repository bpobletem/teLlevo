import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SolicitudesViaje } from 'src/app/interfaces/interfaces';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-solicitudes-viaje',
  templateUrl: './solicitudes-de-viaje.page.html',
  styleUrls: ['./solicitudes-de-viaje.page.scss'],
})
export class SolicitudesDeViajePage implements OnInit {
  viajeId: string = '';
  solicitudes: SolicitudesViaje[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firebaseSrv: FirebaseService,
    private mapService: MapService // Inject MapService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation()?.extras.state;
    if (navigation && navigation['viajeId']) {
      this.viajeId = navigation['viajeId'];
      console.log('Viaje ID recibido en SolicitudesDeViajePage:', this.viajeId);
      this.cargarSolicitudes();
    } else {
      console.error('No se recibió el viajeId en NavigationExtras');
    }
  }

  cargarSolicitudes() {
    this.firebaseSrv.getCollectionChanges<SolicitudesViaje>('SolicitudesViaje').subscribe((solicitudes) => {
      console.log('Todas las solicitudes obtenidas:', solicitudes);
      
      this.solicitudes = solicitudes.filter(solicitud => {
        console.log('Comparando viajeId:', solicitud.viajeId, 'con', this.viajeId);
        return solicitud.viajeId === this.viajeId && solicitud.estado === 'pendiente';
      });
      
      console.log('Solicitudes filtradas:', this.solicitudes);
    });
  }

  async aceptarSolicitud(solicitud: SolicitudesViaje) {
    try {
      // Convert the 'parada' address to coordinates
      const coords = await this.mapService.getCoordsFromAddress(solicitud.parada);
      if (coords) {
        // Add the stop to the route in MapService
        this.mapService.addStop(coords, this.viajeId);

        // Update the solicitud status to 'aceptado'
        await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, {
          estado: 'aceptado'
        });

        // Add the passenger to viaje's 'pasajeros' array
        await this.firebaseSrv.addPassengerToArray(this.viajeId, solicitud.pasajeroId);

        console.log('Solicitud aceptada y parada añadida:', coords);
      } else {
        console.error('Error al obtener coordenadas para la parada');
      }
    } catch (error) {
      console.error('Error al aceptar la solicitud:', error);
    }
  }

  async rechazarSolicitud(solicitud: SolicitudesViaje) {
    try {
      // Update the solicitud status to 'rechazado' in Firebase
      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, {
        estado: 'rechazado'
      });
      console.log('Solicitud rechazada');

      // Remove the rejected request from the displayed list
      this.solicitudes = this.solicitudes.filter(s => s !== solicitud);
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
    }
  }

  iniciarViaje() {
  // Navigate to "Viaje en Curso" page with the viajeId
  const navigationExtras: NavigationExtras = { state: { viajeId: this.viajeId } };
  this.router.navigate(['/viaje-en-curso'], navigationExtras);
}
}
