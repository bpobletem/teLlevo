import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auto, Usuario, Viaje, estadoViaje } from 'src/app/interfaces/interfaces';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MapService } from 'src/app/services/map.service'; // Importamos MapService

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {

  formularioViaje!: FormGroup;
  usuarioActual: Usuario | null = null;
  autos = []; // Lista de autos disponibles
  autoSeleccionado: Auto | null = null; // Auto seleccionado

  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService);
  mapService = inject(MapService); // Inyectamos MapService

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  uid = '';

  async ngOnInit(): Promise<void> {
    await this.inicializarFormulario();
    await this.cargarUsuarioActual();
    this.uid = await this.localStorageSrv.get('sesion');
    this.firebaseSrv.getCollectionChanges<Auto>('Auto').subscribe((autos) => {
      console.log(this.uid);
      this.autos = autos.filter((auto) => auto.propietario === `Usuario/${this.uid}`);
    });

    // Inicializamos el mapa
    await this.mapService.buildMap('mapContainer');
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      precio: [0, Validators.required],
      auto: [null, Validators.required] // Campo para el auto seleccionado
    });
  }

  async obtenerAutos() {
    try {
      const uid = await this.localStorageSrv.get('sesion');
      const autos = await this.firebaseSrv.getDocumentsByReference(`Auto`, `propietario`, `Usuario/${uid}`);
      this.autos = autos;  // Asignamos los autos obtenidos al array de autos
      console.log('Autos:', this.autos);
    } catch (error) {
      console.error('Error al obtener los autos:', error);
    }
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

  onDestinoSeleccionado(destino: string, coords: [number, number]): void {
    this.formularioViaje.get('destino')?.setValue(destino);
    this.mapService.onDestinoSeleccionado(destino, coords); // Llamamos a la función en MapService
  }

  addParada(coords: [number, number]): void {
    this.mapService.addStop(coords); // Añadimos la parada y actualizamos la ruta
  }

  async crearViaje() {
    if (this.formularioViaje?.valid && this.usuarioActual) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      const viaje: Viaje = {
        estado: estadoViaje.pendiente,
        piloto: this.usuarioActual,
        pasajeros: [],
        destino: this.formularioViaje.value.destino,
        fechaSalida: this.formularioViaje.value.fechaSalida,
        auto: this.formularioViaje.value.auto, // Guardar el auto seleccionado
        precio: this.formularioViaje.value.precio
      };

      try {
        const path = `Viajes/${this.usuarioActual.uid}_${new Date().getTime()}`;
        await this.firebaseSrv.setDocument(path, viaje);

        this.utilsSrv.presentToast({
          message: 'Viaje creado exitosamente',
          duration: 2500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
        this.router.navigate(['/home']);
        this.formularioViaje.reset();
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
