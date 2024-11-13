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
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    console.log(nav)
    this.viaje = nav?.extras?.state?.['viajeId'] || {}; // Carga los datos del viaje
    const currentUserUid = await this.storageSrv.get('sesion');
    this.esPiloto = currentUserUid === this.viaje?.piloto?.uid;

    console.log(this.viaje);

    if (this.viaje.id) {
      this.loadViajeById(this.viaje)
    }
  } 
  async loadViajeById(viajeId: string) {
    try {
      const viaje = await this.firebaseSrv.getDocumentById('Viajes', viajeId);
      console.log('Viaje data:', viaje);
      // Handle the viaje data as needed

	    this.mapService.stops = this.viaje.rutas.map((parada: any) => [parada.lng, parada.lat]);
      this.mapService.updateOptimizedRoute(); // Actualiza la ruta con todas las paradas	
    } catch (error) {
      console.error('Error fetching Viaje:', error);
    }
  }

  async ngAfterViewInit() {
    // Espera que el contenedor esté listo antes de inicializar el mapa
    await this.mapService.buildMap('mapContainer').then(() => {
      if (this.viaje.rutas) {
        this.mapService.stops = this.viaje.rutas.map((parada: any) => [parada.lng, parada.lat]);
        this.mapService.updateOptimizedRoute(); // Dibuja la ruta optimizada en el mapa
      }
    }).catch(error => console.error('Error al mostrar el mapa:', error));
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
