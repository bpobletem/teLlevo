import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage {

  trips = [
    { id: '1', driverName: 'Alice', startLocation: 'Duoc', destination: 'Mall', departureTime: '08:00 AM', availableSeats: 3, price: '3000' },
    { id: '2', driverName: 'Bob', startLocation: 'Universidad', destination: 'Centro', departureTime: '08:15 AM', availableSeats: 2, price: '3000' },
    { id: '3', driverName: 'Charlie', startLocation: 'Casa', destination: 'Oficina', departureTime: '08:30 AM', availableSeats: 4, price: '3000' },
    { id: '4', driverName: 'Daniel', startLocation: 'Plaza', destination: 'Higueras', departureTime: '07:45 AM', availableSeats: 1, price: '3000' },
  ];

  constructor(private router: Router) { }

  unirseAlViaje(trip: any) {
    this.router.navigate(['/viaje-en-curso'], { state: { trip } });
  }
}
