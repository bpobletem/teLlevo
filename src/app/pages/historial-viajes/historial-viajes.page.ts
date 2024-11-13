import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
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

    const userId = await this.localStorageSrv.get('sesion');
    const viajes = await this.firebaseSrv.getDocumentsByPilotOrPassengerUid('Viajes', userId);
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

  getColorByEstado(estado: string): string {
    switch (estado) {
      case 'en-curso':
        return 'primary';
      case 'pendiente':
        return 'tertiary';
      case 'terminado':
        return 'success';
      case 'cancelado':
        return 'danger';
      default:
        return 'primary';
    }
  }

  goToSolicitudes(viajeId: string) {
    const navigationExtras: NavigationExtras = {
      state: { viajeId: viajeId }
    };
    this.router.navigate(['/solicitudes-de-viaje'], navigationExtras);
  }
}
