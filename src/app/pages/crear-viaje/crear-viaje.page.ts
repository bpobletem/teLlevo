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
      const controlValue = control.value;
  
      if (!controlValue) {
        console.log('Control value is empty or invalid.');
        return null;
      }
  
      const selectedDate = new Date(`${controlValue}T00:00:00`);
      if (isNaN(selectedDate.getTime())) {
        console.log('Invalid date format:', controlValue);
        return { invalidDate: true };
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      oneWeekFromNow.setHours(0, 0, 0, 0);
  
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
      auto: [null, Validators.required],
      asientosDisponibles: [0, [Validators.required, Validators.min(1)]],
      uid: ['']
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
        asientosDisponibles: this.formularioViaje.value.asientosDisponibles,
        precio: this.formularioViaje.value.precio,
        rutas: [] // Initialize rutas as an empty array
      };

      try {
        const docRef = await this.firebaseSrv.addDocument('Viajes', viaje);
        console.log('Document ID:', docRef);

        // Navigate with the new document ID
        const navigationExtras: NavigationExtras = { state: { viajeId: docRef} };
        this.router.navigate(['/solicitudes-de-viaje'], navigationExtras);
        this.utilsSrv.presentToast({
            message: 'Viaje creado exitosamente',
            duration: 2500,
            color: 'primary',
            position: 'bottom',
            icon: 'checkmark-circle-outline'
        });

        // Reset the form and navigate
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
