import { compileNgModule } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage implements OnInit {

  constructor() { }

  trips = [
    { id: '1', driverName: 'Alice', destination: 'Duoc', departureTime: '08:00 AM', availableSeats: 3 , price:'3000'},
    { id: '2', driverName: 'Bob', destination: 'Huertos Familiares', departureTime: '08:15 AM', availableSeats: 2 , price:'3000'},
    { id: '3', driverName: 'Charlie', destination: 'Chiguayante', departureTime: '08:30 AM', availableSeats: 4 , price:'3000'},
    { id: '4', driverName: 'Daniel', destination: 'Higueras', departureTime: '07:45 AM', availableSeats: 1 , price:'3000'},
  ];


  unirseAlViaje(){
    console.log("Uniendote al viaje")
  }

  ngOnInit() {
  }

}
