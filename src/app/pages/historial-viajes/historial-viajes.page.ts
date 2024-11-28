import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { estadoViaje, Viaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {

  localStorageSrv = inject(StorageService);
  firebaseSrv = inject(FirebaseService);

  isPiloto: boolean = true;
  isPasajero: boolean = true;

  viajesPiloto = [];
  viajesPasajero = [];

  constructor(private router: Router) { }

  async ngOnInit() {
  }

  async ionViewWillEnter(){
    const user = await this.localStorageSrv.getUserFromSesion()
    this.subscribeToViajes(user.uid);
    const viajes = await this.firebaseSrv.getDocumentsByPilotOrPassengerUid('Viajes', user.uid);
    const {pilotResults, passengerResults} = viajes;
    this.viajesPiloto = pilotResults;
    this.viajesPasajero = passengerResults;
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
    this.firebaseSrv.getCollectionChanges('Viajes').subscribe({
      next: (viajes: any[]) => {
        const pilotResults = viajes.filter(viaje => viaje.piloto.uid === uid);
        const passengerResults = viajes.filter(viaje => viaje.pasajeros.includes(uid));
        this.viajesPiloto = pilotResults;
        this.viajesPasajero = passengerResults;
        console.log('Updated viajes:', { pilotResults, passengerResults });
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
