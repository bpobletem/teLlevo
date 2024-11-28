import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MapService } from 'src/app/services/map.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-viaje-en-curso',
  templateUrl: './viaje-en-curso.page.html',
  styleUrls: ['./viaje-en-curso.page.scss'],
})
export class ViajeEnCursoPage implements OnInit {
  viaje: any = {};
  esPiloto: boolean = false;
  mapInitialized: boolean = false;
  viajeCargado: boolean = false; // Indica si los datos del viaje están listos

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

      if (this.viajeCargado) {
        console.log('Viaje cargado completamente. Inicializando mapa...');
        await this.initializeMap(); // Inicializa el mapa solo si los datos están listos
      } else {
        console.warn('Los datos del viaje no están listos.');
      }
    } else {
      console.error('No se encontró un viajeId.');
      this.router.navigate(['/home']);
    }

    const currentUserUid = await this.storageSrv.get('sesion');
    this.esPiloto = currentUserUid === this.viaje?.piloto?.uid;
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

        // Marca que los datos del viaje están listos
        this.viajeCargado = true;
      }
    } catch (error) {
      console.error('Error al cargar detalles del viaje:', error);
    }
  }

  async initializeMap() {
    if (this.mapInitialized) return;

    try {
      console.log('Inicializando mapa para Viaje en Curso...');
      const mapContainer = document.getElementById('mapContainer');

      if (!mapContainer) {
        console.error('Contenedor del mapa no encontrado.');
        return;
      }

      // Construir el mapa desde los datos del viaje
      await this.mapService.buildMapFromData('mapContainer', this.viaje);
      this.mapInitialized = true;
    } catch (error) {
      console.error('Error inicializando el mapa:', error);
    }
  }

  finalizarViaje() {
    if (this.viaje.id && this.esPiloto) {
      this.firebaseSrv
        .updateDocument(`Viajes/${this.viaje.id}`, { estado: 'finalizado' })
        .then(() => this.router.navigate(['/home']))
        .catch((error) => console.error('Error finalizando el viaje:', error));
    }
  }

  cancelarViaje() {
    if (this.viaje.id) {
      this.firebaseSrv
        .updateDocument(`Viajes/${this.viaje.id}`, { estado: 'cancelado' })
        .then(() => this.router.navigate(['/home']))
        .catch((error) => console.error('Error cancelando el viaje:', error));
    }
  }

  verHistorial() {
    const showPiloto = this.esPiloto !== undefined ? this.esPiloto : false;
    this.router.navigate(['/historial-viajes'], { state: { showPiloto } });
  }
}
