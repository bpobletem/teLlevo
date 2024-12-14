import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { estadoViaje, Usuario, Viaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {

  localStorageSrv = inject(StorageService);
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);

  isPiloto: boolean = true;
  isPasajero: boolean = true;
  user: Usuario;

  viajesPiloto = [];
  viajesPasajero = [];

  constructor(private router: Router) { }

  async ngOnInit() {
  }

  async ionViewWillEnter(){
    const loading = await this.utilsSrv.loading();
    await loading.present();
    const user = await this.localStorageSrv.getUserFromSesion();
    this.subscribeToViajes(user.uid);
    const viajes = await this.firebaseSrv.getDocumentsByPilotOrPassengerUid('Viajes', user.uid);
    const { pilotResults, passengerResults } = viajes;

    // Sort viajes by date in descending order
    this.viajesPiloto = (pilotResults as Viaje[]).sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());
    this.viajesPasajero = (passengerResults as Viaje[]).sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());

    // Store the last viaje
    if (this.viajesPiloto.length > 0) {
      await this.localStorageSrv.set('lastViaje', this.viajesPiloto[0]);
    } else if (this.viajesPasajero.length > 0) {
      await this.localStorageSrv.set('lastViaje', this.viajesPasajero[0]);
    } else {
      // Load the last viaje from local storage if no viajes are fetched
      const lastViaje = await this.localStorageSrv.get('lastViaje');
      if (lastViaje) {
        if (lastViaje.piloto.uid === user.uid) {
          this.viajesPiloto = [lastViaje];
        } else if (lastViaje.pasajeros.some(pasajero => pasajero.uid === user.uid)) {
          this.viajesPasajero = [lastViaje];
        }
      }
    }

    loading.dismiss();
  }

  showTrips(type: string) {
    if (type === 'piloto') {
      this.isPiloto = true;
      this.isPasajero = false;
    } else {
      this.isPiloto = false;
      this.isPasajero = true;
    }
  }

  getColorByEstado(estado: estadoViaje): string {
    switch (estado) {
      case estadoViaje.enCurso:
        return 'primary';
      case estadoViaje.pendiente:
        return 'tertiary';
      case estadoViaje.finalizado:
        return 'success';
      case estadoViaje.cancelado:
        return 'danger';
      default:
        return 'primary';
    }
  }

  subscribeToViajes(uid: string) {
    this.firebaseSrv.getCollectionChanges<Viaje>('Viajes').subscribe({
      next: (viajes: Viaje[]) => {
        const pilotResults = viajes.filter(viaje => viaje.piloto.uid === uid);
        const passengerResults = viajes.filter(viaje => viaje.pasajeros.some(pasajero => pasajero.uid === this.user.uid));

        // Sort viajes by date in descending order
        this.viajesPiloto = (pilotResults as Viaje[]).sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());
        this.viajesPasajero = (passengerResults as Viaje[]).sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());

        // Store the last viaje
        if (this.viajesPiloto.length > 0) {
          this.localStorageSrv.set('lastViaje', this.viajesPiloto[0]);
        } else if (this.viajesPasajero.length > 0) {
          this.localStorageSrv.set('lastViaje', this.viajesPasajero[0]);
        }
      },
      error: (error) => {
        console.error('Error fetching viajes:', error);
      }
    });
  }

  goToSolicitudes(viaje: Viaje) {
    if (viaje.estado === 'pendiente') {
      const xtra: NavigationExtras = {
        state: { viajeId: viaje.id }
      };
      this.router.navigate(['/solicitudes-de-viaje'], xtra);
    } else if (viaje.estado === estadoViaje.enCurso) {
      const navxtra: NavigationExtras = {
        state: { viajeId: viaje.id }
      };
      this.router.navigate(['/viaje-en-curso'], navxtra);
    } else {
      return
    }
    
  }
}
