import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { Auto, Usuario, Viaje, estadoViaje } from 'src/app/interfaces/interfaces';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {

  formularioViaje!: FormGroup;
  usuarioActual: Usuario | null = null;
  autos = [];
  autoSeleccionado: Auto | null = null;
  uid = '';

  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService);
  mapService = inject(MapService);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.inicializarFormulario();
    await this.cargarUsuarioActual();
    this.uid = await this.localStorageSrv.get('sesion');
    
    // Cargar autos del usuario
    this.firebaseSrv.getCollectionChanges<Auto>('Auto').subscribe((autos) => {
      this.autos = autos.filter((auto) => auto.propietario === `Usuario/${this.uid}`);
    });

    // Obtener la dirección seleccionada en el mapa y asignarla al formulario
    this.mapService.cbAddress.subscribe((destino: string) => {
      this.formularioViaje.get('destino')?.setValue(destino);
    });

    await this.mapService.buildMap('mapContainer');
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      precio: [0, Validators.required],
      auto: [null, Validators.required]
    });
  }

  async cargarUsuarioActual(): Promise<void> {
    try {
      const uid = await this.localStorageSrv.get('sesion');
      if (uid) {
        const pathUsuario = `Usuario/${uid}`;
        this.usuarioActual = await this.firebaseSrv.getDocument(pathUsuario) as Usuario;
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
      this.utilsSrv.presentToast({
        message: 'Error al cargar los datos del usuario.',
        duration: 2500,
        color: 'danger',
        position: 'bottom'
      });
    }
  }

  async crearViaje() {
    if (this.formularioViaje.valid && this.usuarioActual) {
        const loading = await this.utilsSrv.loading();
        await loading.present();

        const viaje: Viaje = {
            estado: estadoViaje.pendiente,
            piloto: this.usuarioActual,
            pasajeros: [],
            destino: this.formularioViaje.value.destino,
            fechaSalida: this.formularioViaje.value.fechaSalida,
            auto: this.formularioViaje.value.auto,
            precio: this.formularioViaje.value.precio
        };

        try {
            // Crear un ID de viaje único
            const viajeId = `${this.usuarioActual.uid}_${new Date().getTime()}`;
            console.log('Generated viajeId:', viajeId);  // Agrega este log para verificar
            const path = `Viajes/${viajeId}`;
            await this.firebaseSrv.setDocument(path, viaje);

            // Navegar a la página de solicitudes con el `viajeId`
            const navigationExtras: NavigationExtras = { state: { viajeId: viajeId } };
            this.utilsSrv.presentToast({
                message: 'Viaje creado exitosamente',
                duration: 2500,
                color: 'primary',
                position: 'bottom',
                icon: 'checkmark-circle-outline'
            });

            // Resetear el formulario y navegar
            this.formularioViaje.reset();
            this.router.navigate(['/solicitudes-de-viaje'], navigationExtras);

        } catch (error) {
            this.utilsSrv.presentToast({
                message: 'Error al crear el viaje: ' + error.message,
                duration: 2500,
                color: 'danger',
                position: 'bottom',
                icon: 'alert-circle-outline'
            });
            console.error('Error al guardar el documento en Firestore:', error);
        } finally {
            loading.dismiss();
        }
    } else {
        this.utilsSrv.presentToast({
            message: 'Formulario incompleto o usuario no cargado',
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
        });
    }
}

}
