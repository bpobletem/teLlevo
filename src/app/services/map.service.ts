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
  stops: [number, number][] = []; // Lista de paradas adicionales

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
          this.onDestinoSeleccionado(event.result.place_name, destinationCoords);
        });

        resolve({ map: this.map, geocoder });
      } catch (e) {
        reject(e);
      }
    });
  }

  addMarker(coords: [number, number], type: 'driver' | 'destination' | 'stop'): void {
    const marker = new mapboxgl.Marker().setLngLat(coords).addTo(this.map);
    if (type === 'driver') {
      this.markerDriver = marker;
    } else if (type === 'destination') {
      this.markerDestination = marker;
      this.stops = [coords]; // Iniciar la lista de paradas con el primer destino
    } else if (type === 'stop') {
      this.stops.push(coords); // Agregar la parada a la lista de paradas
    }
  }

  onDestinoSeleccionado(destino: string, coords: [number, number]): void {
    this.addMarker(coords, 'destination');
    this.updateRoute(); // Recalcular la ruta incluyendo el destino inicial
  }

  addStop(coords: [number, number]): void {
    this.addMarker(coords, 'stop');
    this.updateRoute(); // Recalcular la ruta incluyendo la nueva parada
  }

  updateRoute(): void {
    const allPoints = [[this.lng, this.lat], ...this.stops]; // Puntos de inicio, destino, y todas las paradas
    const coordinatesString = allPoints.map(point => point.join(',')).join(';');

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

        this.map.fitBounds(route, {
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
