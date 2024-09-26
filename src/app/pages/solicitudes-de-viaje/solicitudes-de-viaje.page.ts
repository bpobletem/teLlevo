import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitudes-viaje',
  templateUrl: './solicitudes-de-viaje.page.html',
  styleUrls: ['./solicitudes-de-viaje.page.scss'],
})
export class SolicitudesDeViajePage {

  solicitudes = [
    { id: 1, nombre: 'Carlos Muñoz', lugarInicio: 'Duoc', destino: 'Chiguayante', hora: '08:00 AM' },
    { id: 2, nombre: 'Lucía Fernández', lugarInicio: 'Duoc', destino: 'Centro', hora: '08:15 AM' }
  ];

  constructor(private router: Router) {}

  verDetalleSolicitud(solicitud: any) {
    this.router.navigate(['/detalle-viaje'], { state: { solicitud, piloto: true } });
  }

  comenzarViaje() {
    this.router.navigate(['/viaje-en-curso'], { state: { piloto: true, trip: { startLocation: 'Duoc', destination: 'Mall', departureTime: '08:00 AM', availableSeats: 3, price: '3000', auto: 'Toyota Corolla' } } });
  }

  verHistorial() {
    this.router.navigate(['/historial-viajes'], { state: { showPiloto: true } });
  }
}
