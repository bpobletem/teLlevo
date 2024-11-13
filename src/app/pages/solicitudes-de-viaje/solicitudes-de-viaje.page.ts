import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
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
  viaje: any;

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
    private mapService: MapService
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
      await this.firebaseSrv.updateDocument(`SolicitudesViaje/${solicitud.viajeId + solicitud.pasajeroId}`, { estado: 'rechazado' });
      this.solicitudes = this.solicitudes.filter(s => s !== solicitud);
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
    }
  }

  iniciarViaje() {
    const navigationExtras: NavigationExtras = { state: { viajeId: this.viajeId } };
    this.router.navigate(['/viaje-en-curso'], navigationExtras);
  }
}
