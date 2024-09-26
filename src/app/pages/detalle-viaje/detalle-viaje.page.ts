import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
})
export class DetalleViajePage implements OnInit {

  destino: string = '';
  esPiloto: boolean = false;
  pasajero: any;

  constructor(private alertController: AlertController, private router: Router) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.esPiloto = navigation.extras.state['piloto'];
      this.pasajero = navigation.extras.state['solicitud'];
    }
  }

  seleccionarDestino(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    this.destino = `(${x}, ${y})`; // Simula las coordenadas donde el usuario hizo clic.
    console.log('Destino seleccionado:', this.destino);
  }

  async unirseAlViaje() {
    const alert = await this.alertController.create({
      header: 'Solicitud de viaje',
      message: `Tu destino ha sido marcado en ${this.destino}. ¿Deseas confirmar unirte al viaje?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            console.log('Solicitud confirmada');
          }
        }
      ]
    });

    await alert.present();
  }

  async aceptarPasajero() {
    const alert = await this.alertController.create({
      header: 'Pasajero aceptado',
      message: `Haz aceptado a ${this.pasajero.nombre} a tu viaje.`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/solicitudes-de-viaje']);
          }
        }
      ]
    });

    await alert.present();
  }

  async rechazarPasajero() {
    const alert = await this.alertController.create({
      header: 'Pasajero rechazado',
      message: `Haz rechazado a ${this.pasajero.nombre}.`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/solicitudes-de-viaje']);
          }
        }
      ]
    });

    await alert.present();
  }
}
