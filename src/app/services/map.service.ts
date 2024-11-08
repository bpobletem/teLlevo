import { Injectable, EventEmitter } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  cbAddress: EventEmitter<any> = new EventEmitter<any>();
  mapbox = (mapboxgl as any);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = -36.79517; // Coordenadas del instituto
  lng = -73.06259;
  zoom = 15;
  markerDriver: any = null;
  markerDestination: any = null;

  constructor(private httpClient: HttpClient, private firestore: Firestore) {
    this.mapbox.accessToken = environment.mapKey;
  }

  buildMap(containerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Inicializar el mapa
        this.map = new mapboxgl.Map({
          container: containerId,
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat],
        });

        // Agregar el marcador inicial en el instituto
        this.addMarker([this.lng, this.lat], 'driver');

        // Configurar el geocodificador
        const geocoder = new MapboxGeocoder({
          accessToken: this.mapbox.accessToken,
          mapboxgl: mapboxgl,
          placeholder: 'Buscar destino',
          countries: 'CL', // Limitar las sugerencias a Chile
          proximity: { longitude: this.lng, latitude: this.lat }, // Priorizar resultados cercanos
        });

        // Agregar el geocodificador al mapa
        this.map.addControl(geocoder);

        // Manejar la selección de un resultado
        geocoder.on('result', (event) => {
          const destinationCoords = event.result.center;
          this.addMarker(destinationCoords, 'destination');
          this.loadRoute([this.lng, this.lat], destinationCoords);
        });

        resolve({ map: this.map, geocoder });
      } catch (e) {
        reject(e);
      }
    });
  }

  addMarker(coords: [number, number], type: 'driver' | 'destination'): void {
    if (type === 'driver') {
      if (!this.markerDriver) {
        // Usa el marcador predeterminado de Mapbox para el punto de inicio
        this.markerDriver = new mapboxgl.Marker()
          .setLngLat(coords)
          .addTo(this.map);
      } else {
        this.markerDriver.setLngLat(coords);
      }
    } else {
      if (!this.markerDestination) {
        // Usa el marcador predeterminado de Mapbox para el destino
        this.markerDestination = new mapboxgl.Marker()
          .setLngLat(coords)
          .addTo(this.map);
      } else {
        this.markerDestination.setLngLat(coords);
      }
    }
  }

  loadRoute(start: [number, number], end: [number, number]): void {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${this.mapbox.accessToken}`;

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

        this.map.fitBounds([start, end], {
          padding: 50,
        });

        // Guardar la ruta en Firestore
        const routeCollection = collection(this.firestore, 'rutas');
        const routeData = route.map((point: [number, number]) => ({
          lng: point[0],
          lat: point[1],
        }));
        addDoc(routeCollection, { points: routeData });
      } else {
        console.error('No se encontraron rutas válidas');
      }
    });
  }
}
