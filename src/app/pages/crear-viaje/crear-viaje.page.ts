import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage  {

  trip = {
    startLocation: '',
    destination: '',
    departureTime: '',
    availableSeats: null,
    price: ''
  };

  constructor(private router: Router) { }

  createTrip() {
    console.log('Trip created:', this.trip);
  }

}
