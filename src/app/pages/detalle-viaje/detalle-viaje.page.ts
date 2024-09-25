import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
AlertController

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
})
export class DetalleViajePage implements OnInit {

  destino: string = '';

  constructor(private alertController: AlertController) { }

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
  ngOnInit() {
  }

}
