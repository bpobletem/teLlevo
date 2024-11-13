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
            // Clear existing map if any
            const container = document.getElementById(containerId);
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }

            // Initialize the map
            this.map = new mapboxgl.Map({
                container: containerId,
                style: this.style,
                zoom: this.zoom,
                center: [this.lng, this.lat],
            });

            // Wait for the style to load before proceeding
            this.map.on('load', () => {
                console.log('Map style fully loaded.');

                // Add initial marker at DUOC
                const startCoords: [number, number] = [this.lng, this.lat];
                this.addMarker(startCoords, 'driver');
                this.stops.push(startCoords);

                // Add geocoder for finding destinations
                const geocoder = new MapboxGeocoder({
                    accessToken: this.mapbox.accessToken,
                    mapboxgl: mapboxgl,
                    placeholder: 'Buscar destino',
                    countries: 'CL',
                    proximity: { longitude: this.lng, latitude: this.lat },
                });
                this.map.addControl(geocoder);

                // Handle geocoder result (destination selection)
                geocoder.on('result', (event) => {
                    const destinationCoords = event.result.center;
                    this.addStop(destinationCoords);
                    this.updateRoute();
                    this.cbAddress.emit(event.result.place_name); // Emit the selected address
                });

                // Resolve only after everything is initialized
                resolve({ map: this.map, geocoder });
            });

            this.map.on('error', (error) => {
                console.error('Map error:', error);
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}



  addMarker(coords: [number, number], type: 'driver' | 'destination'): void {
    new mapboxgl.Marker().setLngLat(coords).addTo(this.map);
  }
  
  addStop(coords: [number, number], viajeId?: string): void {
    this.stops.push(coords);

    if (viajeId) {
        this.updateFirebaseRoutes(viajeId); // Guarda las coordenadas en Firebase
    }
    this.updateRoute(); // Muestra la ruta con los puntos actuales sin optimización
}

updateRoute(): void {
  if (!this.stops || this.stops.length < 2) {
      console.warn("No hay suficientes puntos para dibujar una ruta.");
      return;
  }

  const coordinates = this.stops.map(point => point.join(',')).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?steps=true&geometries=geojson&access_token=${this.mapbox.accessToken}`;

  this.httpClient.get(url).subscribe(
      (res: any) => {
          if (res?.routes?.[0]?.geometry?.coordinates) {
              const route = res.routes[0].geometry.coordinates;
              this.drawRouteOnMap(route, 'route');
          } else {
              console.error('No se encontró una ruta válida:', res);
          }
      },
      error => console.error('Error al obtener la ruta:', error)
  );
}



  updateOptimizedRoute(): void {
    if (this.stops.length < 2) {
      console.warn("Cannot calculate optimized route with less than two stops.");
      return;
    }
  
    const coordinatesString = this.stops.map((point) => point.join(',')).join(';');
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinatesString}?roundtrip=false&source=first&destination=last&access_token=${this.mapbox.accessToken}`;
  
    console.log("Fetching optimized route with URL:", url);
    console.log("Current stops:", this.stops);
  
    this.httpClient.get(url).subscribe((res: any) => {
      if (res?.trips?.[0]?.geometry?.coordinates) {
        const optimizedRoute = res.trips[0].geometry.coordinates;
        this.drawRouteOnMap(optimizedRoute, 'optimizedRoute');
        console.log("Optimized route data found and drawn.");
      } else {
        console.log("Optimized route data not found.", res);
      }
    }, (error) => console.error("Error fetching optimized route:", error));
  }
  

  drawRouteOnMap(route: [number, number][], layerId: string): void {
    if (this.map.getSource(layerId)) {
      this.map.removeLayer(layerId);
      this.map.removeSource(layerId);
    }

    this.map.addSource(layerId, {
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
      id: layerId,
      type: 'line',
      source: layerId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': layerId === 'optimizedRoute' ? '#1db7dd' : '#888',
        'line-width': 5,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    route.forEach((coord) => bounds.extend(coord));
    this.map.fitBounds(bounds, { padding: 100, maxZoom: 12 });
  }

  async updateFirebaseRoutes(viajeId: string): Promise<void> {
    try {
      const rutas = this.stops.map(([lng, lat]) => ({ lat, lng }));
      await this.firebaseSrv.updateDocument(`Viajes/${viajeId}`, { rutas });
      console.log('Rutas actualizadas en Firebase:', rutas);
    } catch (error) {
      console.error('Error updating routes in Firebase:', error);
    }
  }

  clearStops(): void {
    this.stops = [this.stops[0]];
    if (this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
  }

  async getCoordsFromAddress(address: string): Promise<[number, number]> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.mapbox.accessToken}`;
    
    try {
      const response = await this.httpClient.get<any>(url).toPromise();
      if (response.features && response.features.length > 0) {
        const [lng, lat] = response.features[0].center;
        return [lng, lat];
      } else {
        throw new Error('No coordinates found for the given address');
      }
    } catch (error) {
      console.error('Error obtaining coordinates from address:', error);
      throw error;
    }
  }
}
