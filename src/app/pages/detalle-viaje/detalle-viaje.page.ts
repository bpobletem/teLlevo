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

  formularioViaje!: FormGroup;
  firebaseSrv = inject(FirebaseService);
  storageSrv = inject(StorageService);
  
  viaje: any = {};
  destino: string = '';
  pasajeroId: string = '';
  viajeId: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
   
    

    this.route.queryParams.subscribe(params => {
      const navigation = this.router.getCurrentNavigation()?.extras.state;
      if (navigation !== undefined) {
        this.viaje = navigation['viaje'];
        this.viajeId = this.viaje.id;
        console.log('Viaje ID:', this.viajeId);
      } else {
        console.error('No navigation state found');
      }
    });
    await this.firebaseSrv.checkAndClearSession();

    this.pasajeroId = await this.storageSrv.get('sesion');
    console.log('Pasajero ID:', this.pasajeroId);

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
        destino: this.formularioViaje.get('destino').value,
        pasajeroId: pasajeroId,
        estado: 'pendiente'
      })
      console.log('Solicitud de unión enviada.');
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  }
}