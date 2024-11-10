import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
})
export class DetalleViajePage implements OnInit {

  destino: string = '';
  formularioViaje!: FormGroup;
  firebaseSrv = inject(FirebaseService);
  storageSrv = inject(StorageService);

  viaje: any = {};
  pasajeroId: string = '';
  viajeId: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.pasajeroId = await this.storageSrv.get('sesion');
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.viaje = this.router.getCurrentNavigation()?.extras.state['viaje'];
        this.viajeId = this.viaje.id;
        console.log(this.viajeId);
      }
    });
    this.inicializarFormulario();
  }

  seleccionarDestino(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    this.destino = `(${x}, ${y})`;
    console.log('Destino seleccionado:', this.destino);
  }

  inicializarFormulario() {
    this.formularioViaje = this.formBuilder.group({
      destino: ['', Validators.required],
    });
  }

  onDestinoSeleccionado(destino: string): void {
    this.formularioViaje.get('destino')?.setValue(destino);  // Guarda el destino seleccionado en el formulario
  }

  async unirseAlViaje() {
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
          },
        },
      ],
    });
    await alert.present();
  }

  async solicitarUnirseAlViaje(viajeId: string, pasajeroId: string) {
    try {
      await this.firebaseSrv.setDocument(`SolicitudesViaje/${viajeId + pasajeroId}`, {
        viajeId: viajeId,
        pasajeroId: pasajeroId,
        destino: this.formularioViaje.get('destino')?.value,
        estado: 'pendiente',
      })
      console.log('Solicitud de unión enviada.');
      //redirigimos a buscar viaje mientras se implementa la funcionalidad de solicitudes
      this.router.navigate(['/buscar-viaje']);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  }
}