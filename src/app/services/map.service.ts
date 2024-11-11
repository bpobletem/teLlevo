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
  cbAddress: EventEmitter<any> = new EventEmitter<any>();
  mapbox = (mapboxgl as any);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = -36.79517;
  lng = -73.06259;
  zoom = 15;
  stops: [number, number][] = [];

  constructor(private httpClient: HttpClient, private firebaseSrv: FirebaseService) {
    this.mapbox.accessToken = environment.mapKey;
  }

  async buildMap(containerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.map = new mapboxgl.Map({
          container: containerId,
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat],
        });

        const startCoords: [number, number] = [this.lng, this.lat];
        this.addMarker(startCoords, 'driver');
        this.stops.push(startCoords);

        const geocoder = new MapboxGeocoder({
          accessToken: this.mapbox.accessToken,
          mapboxgl: mapboxgl,
          placeholder: 'Buscar destino',
          countries: 'CL',
          proximity: { longitude: this.lng, latitude: this.lat },
        });

        this.map.addControl(geocoder);

        geocoder.on('result', (event) => {
          const destinationCoords = event.result.center;
          this.addStop(destinationCoords);
          this.updateRoute();
          this.cbAddress.emit(event.result.place_name);
        });

        resolve({ map: this.map, geocoder });
      } catch (e) {
        reject(e);
      }
    });
  }

  addMarker(coords: [number, number], type: 'driver' | 'destination'): void {
    new mapboxgl.Marker().setLngLat(coords).addTo(this.map);
  }

  addStop(coords: [number, number], viajeId?: string): void {
    this.stops.push(coords);
    if (viajeId) {
      this.updateFirebaseRoutes(viajeId);
    }
    this.updateRoute();
  }

  updateRoute(): void {
    if (this.stops.length < 2) {
      console.error("Necesitamos al menos un destino para trazar la ruta.");
      return;
    }

    const coordinatesString = this.stops.map((point) => point.join(',')).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&access_token=${this.mapbox.accessToken}`;

    this.httpClient.get(url).subscribe((res: any) => {
      if (res.routes && res.routes.length > 0) {
        const route = res.routes[0].geometry.coordinates;

        if (this.map.getSource('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }

        this.map.addSource('route', {
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
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#1db7dd',
            'line-width': 5,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        route.forEach((coord) => bounds.extend(coord));
        this.map.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 12,
          linear: true,
        });
      } else {
        console.error('No se encontraron rutas válidas');
      }
    });
  }

  async updateFirebaseRoutes(viajeId: string): Promise<void> {
    try {
      const rutas = this.stops.map(([lng, lat]) => ({ lat, lng }));
      await this.firebaseSrv.updateDocument(`Viajes/${viajeId}`, { rutas });
      console.log('Rutas actualizadas en Firebase:', rutas);
    } catch (error) {
      console.error('Error al actualizar las rutas en Firebase:', error);
    }
  }

  clearStops(): void {
    this.stops = [this.stops[0]];
    if (this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
  }
}
