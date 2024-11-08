import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auto, Usuario, Viaje, estadoViaje } from 'src/app/interfaces/interfaces';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {

  formularioViaje!: FormGroup;
  usuarioActual: Usuario | null = null;
  autoUsuario: Auto | null = null;

  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarioActual();
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      precio: [0, Validators.required]
    });
  }

  async cargarUsuarioActual(): Promise<void> {
    try {
      const uid = await this.localStorageSrv.get('sesion');
      if (uid) {
        const pathUsuario = `Usuario/${uid}`;
        this.usuarioActual = await this.firebaseSrv.getDocument(pathUsuario) as Usuario;

        if (this.usuarioActual?.esConductor) {
          const pathAuto = `Autos/${uid}`;
          this.autoUsuario = await this.firebaseSrv.getDocument(pathAuto) as Auto;
        }
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

  // Método para actualizar el campo destino con el valor seleccionado en el mapa
  onDestinoSeleccionado(destino: string): void {
    this.formularioViaje.get('destino')?.setValue(destino);
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
        auto: this.autoUsuario,
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
        console.error(error);
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
