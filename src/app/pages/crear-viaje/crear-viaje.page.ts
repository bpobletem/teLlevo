import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
    const loading = await this.utilsSrv.loading();
    await loading.present();
  
    try {
      // Step 1: Initialize form
      await this.inicializarFormulario();
      // Step 2: Get user session
      this.uid = await this.localStorageSrv.get('sesion');
      if (!this.uid) {
        throw new Error('No user session found');
      }
      // Step 3: Load current user
      await this.cargarUsuarioActual();
      // Step 4: Load user's cars
      await new Promise<void>((resolve, reject) => {
        this.firebaseSrv.getCollectionChanges<Auto>('Auto').subscribe({
          next: (autos) => {
            this.autos = autos.filter((auto) => auto.propietario === `Usuario/${this.uid}`);
            resolve();
          },
          error: (error) => reject(error)
        });
      });
      // Step 5: Setup map destination listener
      this.mapService.cbAddress.subscribe((destino: string) => {
        this.formularioViaje.get('destino')?.setValue(destino);
      });
      // Step 6: Build map
      await this.mapService.buildMap('mapContainer');
    } catch (error) {
      console.error('Error initializing page:', error);
    } finally {
      loading.dismiss();
    }
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      oneWeekFromNow.setHours(23, 59, 59, 999);

      if (selectedDate < today) {
        return { pastDate: true };
      }
      if (selectedDate > oneWeekFromNow) {
        return { futureDate: true };
      }
      return null;
    };
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
      fechaSalida: ['', [Validators.required, this.dateRangeValidator()]],
      precio: [0, [Validators.required, Validators.min(500)]],
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
