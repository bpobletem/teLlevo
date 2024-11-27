import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { estadoViaje } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MapService } from 'src/app/services/map.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-viaje-en-curso',
  templateUrl: './viaje-en-curso.page.html',
  styleUrls: ['./viaje-en-curso.page.scss'],
})
export class ViajeEnCursoPage implements OnInit, AfterViewInit {
  viaje: any = {};
  esPiloto: boolean = false;
  mapInitialized: boolean = false;

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
    private mapService: MapService,
    private storageSrv: StorageService
  ) {}

  async ngOnInit() {
    console.log('ngOnInit: Component initialized');

    const nav = this.router.getCurrentNavigation();
    const viajeId = nav?.extras?.state?.['viajeId'];
    if (viajeId) {
      await this.loadViajeById(viajeId);
    } else {
      console.error('No viajeId found');
      this.router.navigate(['/home']);
    }

    const currentUserUid = await this.storageSrv.get('sesion');
    this.esPiloto = currentUserUid === this.viaje?.piloto?.uid;
  }

  async initializeMapWithRoutes() {
    if (!this.mapInitialized) {
      // Inicializa el mapa
      await this.mapService.buildMap('mapContainer');
      this.mapInitialized = true;
  
      console.log('Rutas disponibles:', this.viaje.rutas);
  
      // Dibuja la ruta
      const route = this.viaje.rutas.map((parada: any) => [parada.lng, parada.lat]);
      if (route.length > 1) {
        this.mapService.drawRouteOnMap(route, 'route');
        console.log('Ruta dibujada:', route);
      } else {
        console.warn('No se puede dibujar una ruta con menos de dos puntos.');
      }
    }
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit: Inicializando el mapa y rutas...');
    if (this.viaje?.rutas && this.viaje.rutas.length > 0) {
      await this.initializeMapWithRoutes();
    } else {

  }
} 

  async loadViajeById(viajeId: string) {
    try {
      const viaje = await this.firebaseSrv.getDocumentById('Viajes', viajeId);
      if (viaje) {
        this.viaje = viaje;
        console.log('Detalles del viaje cargados:', this.viaje);
  
        if (!this.viaje.rutas || this.viaje.rutas.length === 0) {
          console.warn('Las rutas del viaje están vacías.');
        }
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
    }
  }
    
  
  finalizarViaje() {
    if (this.viaje.id && this.esPiloto) {
      this.firebaseSrv.updateDocument(`Viajes/${this.viaje.id}`, { estado: estadoViaje.finalizado })
        .then(() => this.router.navigate(['/home']))
        .catch((error) => console.error('Error finalizando el viaje:', error));
    }
  }

  cancelarViaje() {
    if (this.viaje.id) {
      this.firebaseSrv.updateDocument(`Viajes/${this.viaje.id}`, { estado: estadoViaje.cancelado })
        .then(() => this.router.navigate(['/home']))
        .catch((error) => console.error('Error cancelando el viaje:', error));
    }
  }

  verHistorial() {
    const showPiloto = this.esPiloto !== undefined ? this.esPiloto : false;
    this.router.navigate(['/historial-viajes'], { state: { showPiloto } });
  }
}
