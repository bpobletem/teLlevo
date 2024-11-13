import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapService } from '../../services/map.service';
import { EstadoSolicitud, estadoViaje } from 'src/app/interfaces/interfaces';
import { EstadoSolicitud, SolicitudesViaje } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
})
export class DetalleViajePage implements OnInit {

  formularioViaje!: FormGroup;
  firebaseSrv = inject(FirebaseService);
  storageSrv = inject(StorageService);
  mapService = inject(MapService);

  viaje: any = {};
  pasajeroId: string = '';
  viajeId: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    this.inicializarFormulario();  // Asegúrate de inicializar el formulario aquí

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras.state['viaje']) {
      this.viaje = navigation.extras.state['viaje'];
      this.viajeId = this.viaje.id || ''; 
      console.log('Viaje ID recibido en DetalleViajePage:', this.viajeId);
    } else {
      console.error('No se recibió el objeto viaje en NavigationExtras');
    }

    await this.firebaseSrv.checkAndClearSession();
    this.pasajeroId = await this.storageSrv.get('sesion');
    console.log('Pasajero ID:', this.pasajeroId);

    this.mapService.cbAddress.subscribe((destino: string) => {
      this.formularioViaje.get('destino')?.setValue(destino);
    });

    await this.mapService.buildMap('mapContainer');
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
    });
  }

 async unirseAlViaje() {
    if (!this.formularioViaje.valid) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, selecciona un destino antes de unirte al viaje.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

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
            this.solicitarUnirseAlViaje(this.viajeId, this.pasajeroId);
            let nav: NavigationExtras = { state: { viajeId: this.viajeId } };
            this.router.navigate(['/historial-solicitud'], nav);
          },
        },
      ],
    });

    await alert.present();
  }

  async solicitarUnirseAlViaje(viajeId: string, pasajeroId: string) {
    try {
      const solicitud: SolicitudesViaje = {
        viajeId: viajeId,
        parada: this.formularioViaje.get('destino')?.value,
        pasajeroId: pasajeroId,
        estado: EstadoSolicitud.pendiente
      });
      console.log('Solicitud de unión enviada:', { viajeId, parada: this.formularioViaje.get('destino')?.value, pasajeroId });
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  }
  
}
