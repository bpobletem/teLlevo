import { Injectable, EventEmitter } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from 'src/app/services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  cbAddress: EventEmitter<string> = new EventEmitter<string>();
  mapbox = (mapboxgl as any);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = -36.79517; // Coordenadas de DUOC
  lng = -73.06259;
  zoom = 15;
  destinationMarker: mapboxgl.Marker | null = null; // Para un único destino

  constructor(private httpClient: HttpClient, private firebaseSrv: FirebaseService) {
    this.mapbox.accessToken = environment.mapKey;
  }

  async buildMap(containerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Limpiar el contenedor del mapa
        const container = document.getElementById(containerId);
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }

        // Inicializar el mapa
        this.map = new mapboxgl.Map({
          container: containerId,
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat],
        });

        // Esperar a que el estilo cargue antes de proceder
        this.map.on('load', () => {
          console.log('Mapa cargado correctamente.');

          // Agregar marcador inicial en DUOC
          const startCoords: [number, number] = [this.lng, this.lat];
          this.addMarker(startCoords, 'driver');

          // Agregar el geocoder para seleccionar un destino
          const geocoder = new MapboxGeocoder({
            accessToken: this.mapbox.accessToken,
            mapboxgl: mapboxgl,
            placeholder: 'Buscar destino',
            countries: 'CL',
            proximity: { longitude: this.lng, latitude: this.lat },
          });
          this.map.addControl(geocoder);

          // Manejar el resultado del geocoder (selección de destino)
          geocoder.on('result', async (event) => {
            const destinationCoords = event.result.center;

            // Actualizar marcador de destino único
            if (this.destinationMarker) {
              this.destinationMarker.remove(); // Quitar el marcador anterior si existe
            }
            this.destinationMarker = new mapboxgl.Marker()
              .setLngLat(destinationCoords)
              .addTo(this.map);

            // Dibujar la ruta desde DUOC hasta el destino seleccionado
            try {
              const route = await this.getRoute(startCoords, destinationCoords);
              this.updateRouteOnMap(route); // Dibuja la ruta en el mapa
              this.cbAddress.emit(event.result.place_name); // Emitir la dirección seleccionada
            } catch (error) {
              console.error('Error al calcular la ruta:', error);
            }
          });

          // Resolver la promesa después de configurar el mapa y el geocoder
          resolve({ map: this.map, geocoder });
        });

        this.map.on('error', (error) => {
          console.error('Error en el mapa:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async buildMapFromData(containerId: string, viaje: any): Promise<void> {
    // Validar datos necesarios antes de inicializar el mapa
    if (!viaje || !viaje.rutas || !viaje.center || !viaje.zoom) {
      return Promise.reject(new Error('Datos incompletos para construir el mapa.'));
    }
  
    const { rutas, center, zoom } = viaje;
  
    // Limpiar el contenedor del mapa
    const container = document.getElementById(containerId);
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  
    // Inicializar el mapa
    this.map = new mapboxgl.Map({
      container: containerId,
      style: this.style,
      zoom: zoom || 15,
      center: [center.lng, center.lat],
    });
  
    // Esperar a que el mapa se cargue completamente
    await new Promise<void>((resolve, reject) => {
      this.map.on('load', () => resolve());
      this.map.on('error', (error) => reject(error));
    });
  
    // Dibujar la ruta
    const route = rutas.map((r: any) => [r.lng, r.lat]);
    this.updateRouteOnMap(route);
  
    // Agregar marcadores
    this.addMarker(route[0], 'driver'); // Marcador de inicio
    this.addMarker(route[route.length - 1], 'destination'); // Marcador de destino
  }
    
  
  addMarker(coords: [number, number], type: 'driver' | 'destination'): void {
    new mapboxgl.Marker().setLngLat(coords).addTo(this.map);
  }
  
  updateRouteOnMap(route: [number, number][]): void {
    // Limpiar la capa de ruta anterior, si existe
    const routeLayerId = 'routeLayer';
    if (this.map.getSource(routeLayerId)) {
      this.map.removeLayer(routeLayerId);
      this.map.removeSource(routeLayerId);
    }

    // Agregar nueva capa de ruta
    this.map.addSource(routeLayerId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      },
    });

    this.map.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeLayerId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#1db7dd',
        'line-width': 5,
      },
    });

    // Ajustar el mapa para incluir la ruta completa
    const bounds = new mapboxgl.LngLatBounds();
    route.forEach((coord) => bounds.extend(coord));
    this.map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  }

  async updateFirebaseRoutes(viajeId: string, rutas: { lat: number; lng: number }[]): Promise<void> {
    try {
      await this.firebaseSrv.updateDocument(`Viajes/${viajeId}`, { rutas });
      console.log('Rutas actualizadas en Firebase:', rutas);
    } catch (error) {
      console.error('Error updating routes in Firebase:', error);
    }
  }  

  async getRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
    const coordinates = `${start.join(',')};${end.join(',')}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${this.mapbox.accessToken}`;
  
    try {
      const response: any = await this.httpClient.get(url).toPromise();
      if (response?.routes?.[0]?.geometry?.coordinates) {
        return response.routes[0].geometry.coordinates;
      } else {
        throw new Error('No se encontró una ruta válida');
      }
    } catch (error) {
      console.error('Error al obtener la ruta desde Mapbox:', error);
      throw error;
    }
  }  
}