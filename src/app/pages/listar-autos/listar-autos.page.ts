import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';  // Asegúrate de que el servicio esté importado
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { StorageService } from 'src/app/services/storage.service';
import { Auto } from 'src/app/interfaces/interfaces';
import { UtilsService } from 'src/app/services/utils.service';
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
  uid = '';
  utilsSrv = inject(UtilsService);
  constructor(private alertController: AlertController, private router: Router) {
    addIcons({ add });
  }

  async ngOnInit() {
    const loading = await this.utilsSrv.loading();
    await loading.present();
  
    const user = await this.storageSrv.getUserFromSesion();
    this.uid = user.uid
    this.firebaseSrv.getCollectionChanges<Auto>('Auto').subscribe((autos) => {
      console.log(this.uid)
      this.autos = autos.filter((auto) => auto.propietario === `Usuario/${this.uid}`);
    });
    loading.dismiss()
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
    //esto no funciona
    this.autos = this.autos.filter(a => a !== auto);
    console.log('Auto eliminado:', auto);
  }
}
