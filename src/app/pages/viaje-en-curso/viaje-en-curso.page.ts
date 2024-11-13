import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MapService } from 'src/app/services/map.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-viaje-en-curso',
  templateUrl: './viaje-en-curso.page.html',
  styleUrls: ['./viaje-en-curso.page.scss'],
})
export class ViajeEnCursoPage implements OnInit, AfterViewInit {
  viaje: any = {}; // Datos actuales del viaje
  esPiloto: boolean = false;

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
    private mapService: MapService,
    private storageSrv: StorageService
  ) {
    console.log('Constructor: Component instance created');
  }

  async ngOnInit() {
    console.log('ngOnInit: Component initialized');

    // Check navigation state for viajeId
    const nav = this.router.getCurrentNavigation();
    const viajeId = nav?.extras?.state?.['viajeId'];
    console.log('ngOnInit: Navigation state:', nav?.extras?.state);

    if (viajeId) {
      console.log('ngOnInit: Loading trip with ID:', viajeId);
      await this.loadViajeById(viajeId);
    } else {
      console.error('ngOnInit: No viajeId found in navigation state');
    }

    // Check if the current user is the pilot
    const currentUserUid = await this.storageSrv.get('sesion');
    console.log('ngOnInit: Current user UID:', currentUserUid);

    this.esPiloto = currentUserUid === this.viaje?.piloto?.uid;
    console.log('ngOnInit: Is current user the pilot?', this.esPiloto);
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit: View initialized');

    try {
      // Initialize the map
      await this.mapService.buildMap('mapContainer');
      console.log('ngAfterViewInit: Map initialized');

      // Check if route data is available
      if (this.viaje?.rutas && this.viaje.rutas.length > 0) {
        console.log('ngAfterViewInit: Routes loaded:', this.viaje.rutas);

        // Assign stops and update the route
        this.mapService.stops = this.viaje.rutas.map((parada: any) => [parada.lng, parada.lat]);
        this.mapService.updateRoute();
        console.log('ngAfterViewInit: Route updated on the map');
      } else {
        console.warn('ngAfterViewInit: No routes found for the trip');
      }
    } catch (error) {
      console.error('ngAfterViewInit: Error initializing the map or updating the route', error);
    }
  }

  async loadViajeById(viajeId: string) {
    console.log('loadViajeById: Fetching trip details for ID:', viajeId);

    try {
      const viaje = await this.firebaseSrv.getDocumentById('Viajes', viajeId);
      if (viaje) {
        this.viaje = viaje;
        console.log('loadViajeById: Trip details loaded:', this.viaje);
      } else {
        console.error('loadViajeById: No trip found for the given ID');
      }
    } catch (error) {
      console.error('loadViajeById: Error fetching trip details:', error);
    }
  }

  finalizarViaje() {
    if (this.viaje.id && this.esPiloto) {
      this.firebaseSrv.updateDocument(`Viajes/${this.viaje.id}`, { estado: 'finalizado' })
        .then(() => this.router.navigate(['/home']))
        .catch(error => console.error('Error finalizando el viaje:', error));
    }
  }

  cancelarViaje() {
    if (this.viaje.id) {
      this.firebaseSrv.updateDocument(`Viajes/${this.viaje.id}`, { estado: 'cancelado' })
        .then(() => this.router.navigate(['/home']))
        .catch(error => console.error('Error cancelando el viaje:', error));
    }
  }

  verHistorial() {
    const showPiloto = this.esPiloto;
    this.router.navigate(['/historial-viajes'], { state: { showPiloto } });
  }
}
