import { Injectable, EventEmitter } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  cbAddress: EventEmitter<string> = new EventEmitter<string>();
  mapbox = (mapboxgl as any);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = -36.79517; // Coordenadas iniciales del origen (por ejemplo, DUOC)
  lng = -73.06259;
  zoom = 15;
  origin: [number, number] = [this.lng, this.lat]; // Origen inicial
  destination: [number, number] | null = null; // Destino seleccionado

  constructor(private httpClient: HttpClient) {
    this.mapbox.accessToken = environment.mapKey;
  }

  async buildMap(containerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const container = document.getElementById(containerId);
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }

        this.map = new mapboxgl.Map({
          container: containerId,
          style: this.style,
          zoom: this.zoom,
          center: this.origin, // Centrar en el origen inicial
        });

        this.map.on('load', () => {
          console.log('Mapa cargado correctamente.');

          // Agregar marcador en el origen
          this.addMarker(this.origin, 'driver');

          // Agregar control para buscar el destino
          const geocoder = new MapboxGeocoder({
            accessToken: this.mapbox.accessToken,
            mapboxgl: mapboxgl,
            placeholder: 'Buscar destino',
            countries: 'CL',
            proximity: { longitude: this.lng, latitude: this.lat },
          });
          this.map.addControl(geocoder);

          // Manejar selección de destino
          geocoder.on('result', (event) => {
            this.destination = event.result.center as [number, number];
            this.addMarker(this.destination, 'destination');
            this.drawRoute(this.origin, this.destination);
            this.cbAddress.emit(event.result.place_name); // Emitir la dirección seleccionada
          });

          resolve(this.map);
        });

        this.map.on('error', (error) => {
          console.error('Error cargando el mapa:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  addMarker(coords: [number, number], type: 'driver' | 'destination'): void {
    const color = type === 'driver' ? 'blue' : 'red';
    new mapboxgl.Marker({ color }).setLngLat(coords).addTo(this.map);
  }

  drawRoute(origin: [number, number], destination: [number, number]): void {
    if (!origin || !destination) {
      console.warn('Origen o destino no definidos.');
      return;
    }

    const coordinates = `${origin.join(',')};${destination.join(',')}`;
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
      (error) => console.error('Error al obtener la ruta:', error)
    );
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
        'line-color': '#1db7dd',
        'line-width': 4,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    route.forEach((coord) => bounds.extend(coord));
    this.map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
  }
}
