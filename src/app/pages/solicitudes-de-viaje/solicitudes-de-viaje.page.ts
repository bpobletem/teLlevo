import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular'; // Asegúrate de importar desde @ionic/angular
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitudes-viaje',
  templateUrl: './solicitudes-de-viaje.page.html',
  styleUrls: ['./solicitudes-de-viaje.page.scss'],
})
export class SolicitudesDeViajePage {

  solicitudes = [
    { nombre: 'Carlos Muñoz', lugarInicio: 'Duoc', destino: 'Mall', hora: '08:00 AM' },
    { nombre: 'Lucía Fernández', lugarInicio: 'Universidad', destino: 'Centro', hora: '08:15 AM' }
  ];

  constructor(private alertController: AlertController, private router: Router) {}

  async aceptarPasajero(solicitante: any) {
    const alert = await this.alertController.create({
      header: 'Solicitud aceptada',
      message: `Haz aceptado a ${solicitante.nombre} a unirse a tu viaje.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async rechazarPasajero(solicitante: any) {
    const alert = await this.alertController.create({
      header: 'Solicitud rechazada',
      message: `Haz rechazado que ${solicitante.nombre} se una a tu viaje.`,
      buttons: ['OK']
    });

    await alert.present();
  } 

  comenzarViaje() {
    this.router.navigate(['/viaje-en-curso'], { state: { piloto: true, trip: { startLocation: 'Duoc', destination: 'Mall', departureTime: '08:00 AM', availableSeats: 3, price: '3000', auto: 'Toyota Corolla' } } });
  }

  verHistorial() {
    this.router.navigate(['/historial-viajes'], { state: { showPiloto: true } });
  }
}
