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

  constructor(
    private router: Router,
    private firebaseSrv: FirebaseService,
    private mapService: MapService,
    private storageSrv: StorageService
  ) {}

  ngOnInit() {
    console.log('ngOnInit: Component initialized');

    const nav = this.router.getCurrentNavigation();
    const viajeId = nav?.extras?.state?.['viajeId'];

    if (viajeId) {
      this.loadViajeById(viajeId)
        .then(() => {
          console.log('Viaje cargado completamente. Inicializando mapa...');
          this.initializeMap();
        })
        .catch((error) => {
          console.error('Error al cargar los datos del viaje:', error);
          this.router.navigate(['/home']);
        });
    } else {
      console.error('No se encontró un viajeId.');
      this.router.navigate(['/home']);
    }

    this.storageSrv
      .get('sesion')
      .then((currentUserUid) => {
        this.esPiloto = currentUserUid === this.viaje?.piloto?.uid;
      })
      .catch((error) => {
        console.error('Error al obtener la sesión del usuario:', error);
      });
  }

  loadViajeById(viajeId: string): Promise<void> {
    return this.firebaseSrv
      .getDocumentById('Viajes', viajeId)
      .then((viaje) => {
        if (viaje) {
          this.viaje = viaje;
          console.log('Detalles del viaje cargados:', this.viaje);

          if (!this.viaje.rutas || this.viaje.rutas.length === 0) {
            console.warn('Las rutas del viaje están vacías.');
          }
        } else {
          throw new Error('El viaje no existe en la base de datos.');
        }
      });
  }

  initializeMap() {
    if (this.mapInitialized) return;

    try {
      console.log('Inicializando mapa para Viaje en Curso...');
      const mapContainer = document.getElementById('mapContainer');

      if (!mapContainer) {
        console.error('Contenedor del mapa no encontrado.');
        return;
      }

      this.mapService
        .buildMapFromData('mapContainer', this.viaje)
        .then(() => {
          this.mapInitialized = true;
          console.log('Mapa inicializado correctamente.');
        })
        .catch((error) => {
          console.error('Error inicializando el mapa:', error);
        });
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
