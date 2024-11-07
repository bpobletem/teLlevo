import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';  // Asegúrate de que el servicio esté importado
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { StorageService } from 'src/app/services/storage.service';
addIcons({ add });

@Component({
  selector: 'app-listar-autos',
  templateUrl: './listar-autos.page.html',
  styleUrls: ['./listar-autos.page.scss'],
})
export class ListarAutosPage implements OnInit {
  autos = [];  // Array para almacenar los autos obtenidos
  firebaseSrv = inject(FirebaseService);  // Inyectamos FirebaseService
  storageSrv = inject(StorageService);
  constructor(private alertController: AlertController, private router: Router) {
    addIcons({ add });
  }

  async ngOnInit() {
    await this.obtenerAutos();  // Llamamos a la función para obtener los autos
  }

  // Función para obtener los autos de Firebase
  async obtenerAutos() {
    try {
      const uid = await this.storageSrv.get('sesion');
      const autos = await this.firebaseSrv.getDocumentsByReference(`Auto`, `propietario`, `Usuario/${uid}`);
      this.autos = autos;  // Asignamos los autos obtenidos al array de autos
      console.log('Autos:', this.autos);
    } catch (error) {
      console.error('Error al obtener los autos:', error);
    }
  }

  // Confirmar eliminación de auto
  async confirmarEliminar(auto: any) {
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

  // Función para navegar a la página de registrar auto
  navigateToRegistrarAuto() {
    this.router.navigate(['/registrar-auto']);
  }

  // Eliminar auto de la lista
  eliminarAuto(auto: any) {
    this.autos = this.autos.filter(a => a !== auto);
    console.log('Auto eliminado:', auto);
  }
}
