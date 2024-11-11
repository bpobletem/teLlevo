import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Output() destinoSeleccionado = new EventEmitter<string>();

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    this.mapService.buildMap('map').then(({ geocoder }) => {
      // Escuchar el evento del geocodificador y emitir el destino seleccionado si es necesario
      geocoder.on('result', (event) => {
        const destino = event.result.place_name;
        this.destinoSeleccionado.emit(destino); // Emitir solo si aún se necesita
      });
    }).catch(error => {
      console.error('Error al inicializar el mapa:', error);
    });
  }
}
