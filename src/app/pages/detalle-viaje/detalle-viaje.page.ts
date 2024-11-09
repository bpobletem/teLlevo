import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
})
export class DetalleViajePage implements OnInit {

  destino: string = '';
  formularioViaje!: FormGroup;
  formBuilder: any;

  constructor(private alertController: AlertController, private router: Router) {

   }

  ngOnInit() {
    this.inicializarFormulario();
  }

  seleccionarDestino(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    this.destino = `(${x}, ${y})`;
    console.log('Destino seleccionado:', this.destino);
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
    });
  }

  onDestinoSeleccionado(destino: string): void {
    this.formularioViaje.get('destino')?.setValue(destino);  // Guarda el destino seleccionado en el formulario
  }

  async unirseAlViaje() {
    const alert = await this.alertController.create({
      header: 'Solicitud de viaje',
      message: `¿Deseas confirmar unirte al viaje?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            //aqui hay que agregar al usuario al array de pasajeros del viaje
            console.log('Solicitud confirmada');
            this.router.navigate(['/historial-viajes']);
          }
        }
      ]
    });
    await alert.present();
  }

  
}
