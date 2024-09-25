import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
addIcons

@Component({
  selector: 'app-listar-autos',
  templateUrl: './listar-autos.page.html',
  styleUrls: ['./listar-autos.page.scss'],
})
export class ListarAutosPage implements OnInit {
  autos = [
    { marca: 'Toyota', modelo: 'Corolla', patente: 'ABC123' },
    { marca: 'Honda', modelo: 'Civic', patente: 'XYZ789' }
  ];

  constructor(private alertController: AlertController, private router: Router) {
    addIcons({ add });
  }

  async confirmarEliminar(auto:any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el auto ${auto.marca} ${auto.modelo} (Patente: ${auto.patente})?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarAuto(auto);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToRegistrarAuto() {
    this.router.navigate(['/registrar-auto']);
  }

  eliminarAuto(auto:any) {
    this.autos = this.autos.filter(a => a !== auto);
    console.log('Auto eliminado:', auto);
  }

  ngOnInit() {
  }

}
