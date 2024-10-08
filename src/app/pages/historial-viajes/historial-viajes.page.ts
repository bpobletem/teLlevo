import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {

  isPiloto: boolean = true;
  isPasajero: boolean = false;

  viajesPiloto = [
    { piloto: 'Juan Pérez', fechaHora: '2024-09-25 14:00', lugarDestino: 'Mall', auto: 'Toyota Corolla', pasajeros: "Juan Perez, Wacoldo Soto" },
    { piloto: 'Ana Torres', fechaHora: '2024-09-26 09:00', lugarDestino: 'Hospital Regional', auto: 'Honda Civic', pasajeros: "Juan Perez, Wacoldo Soto" },
  ];

  viajesPasajero = [
    { piloto: 'Carlos Muñoz', fechaHora: '2024-09-24 18:00', lugarDestino: 'Mall', auto: 'Chevrolet Spark' },
    { piloto: 'Lucía Fernández', fechaHora: '2024-09-27 12:00', lugarDestino: 'Hospital Regional', auto: 'Mazda 3' },
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const showPasajero = nav?.extras?.state?.['showPasajero'];

    if (showPasajero) {
      this.isPiloto = false;
      this.isPasajero = true;
    }
  }

  showTrips(type: string) {
    if (type === 'piloto') {
      this.isPiloto = true;
      this.isPasajero = false;
    } else {
      this.isPiloto = false;
      this.isPasajero = true;
    }
  }
}
