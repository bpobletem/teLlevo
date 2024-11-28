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
      await this.inicializarFormulario();

      this.usuarioActual = await this.localStorageSrv.getUserFromSesion();

      await new Promise<void>((resolve, reject) => {
        this.firebaseSrv.getCollectionChanges<Auto>('Auto').subscribe({
          next: (autos) => {
            this.autos = autos.filter((auto) => auto.propietario === `Usuario/${this.usuarioActual?.uid}`);
            resolve();
          },
          error: (error) => reject(error),
        });
      });

      // Listener para actualizar el destino seleccionado
      this.mapService.cbAddress.subscribe((destino: string) => {
        this.formularioViaje.get('destino')?.setValue(destino);
      });

      // Inicializar el mapa
      await this.mapService.buildMap('mapContainer');
    } catch (error) {
      console.error('Error al inicializar la página:', error);
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
      asientosDisponibles: [0, [Validators.required, Validators.min(1), Validators.max(15)]],
      uid: [''],
    });
  }

  async crearViaje() {
    if (this.formularioViaje.valid && this.usuarioActual) {
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      const destinoCoords = this.mapService.destinationMarker?.getLngLat();
  
      if (!destinoCoords) {
        this.utilsSrv.presentToast({
          message: 'Por favor, selecciona un destino en el mapa.',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
        loading.dismiss();
        return;
      }
  
      // Construir el objeto del viaje
      const viaje: Viaje = {
        estado: estadoViaje.pendiente,
        piloto: this.usuarioActual,
        pasajeros: [],
        destino: this.formularioViaje.value.destino,
        fechaSalida: this.formularioViaje.value.fechaSalida,
        auto: this.formularioViaje.value.auto,
        asientosDisponibles: this.formularioViaje.value.asientosDisponibles,
        precio: this.formularioViaje.value.precio,
        rutas: [], // Inicialmente vacío
        center: { lat: destinoCoords.lat, lng: destinoCoords.lng }, // Centro del mapa
        zoom: this.mapService.zoom, // Nivel de zoom inicial
      };
  
      try {
        // Agregar el documento en Firebase y obtener el ID
        const viajeId = await this.firebaseSrv.addDocument('Viajes', viaje);
  
        // Generar la ruta y actualizar Firebase
        const route = await this.mapService.getRoute(
          [this.mapService.lng, this.mapService.lat], // Origen (DUOC)
          [destinoCoords.lng, destinoCoords.lat] // Destino
        );
  
        viaje.rutas = route.map(([lng, lat]) => ({ lng, lat }));
        await this.firebaseSrv.updateDocument(`Viajes/${viajeId}`, { rutas: viaje.rutas });
  
        console.log('Viaje creado con éxito:', viaje);
  
        // Navegar a la página de solicitudes de viaje
        const navigationExtras: NavigationExtras = { state: { viajeId } };
        this.router.navigate(['/solicitudes-de-viaje'], navigationExtras);
  
        this.utilsSrv.presentToast({
          message: 'Viaje creado exitosamente',
          duration: 2500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
  
        this.formularioViaje.reset();
      } catch (error) {
        console.error('Error al crear el viaje:', error);
        this.utilsSrv.presentToast({
          message: `Error al crear el viaje: ${error.message}`,
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    } else {
      this.utilsSrv.presentToast({
        message: 'Formulario incompleto o usuario no cargado',
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    }
  }
  
}
