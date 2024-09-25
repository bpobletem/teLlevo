import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viaje-en-curso',
  templateUrl: './viaje-en-curso.page.html',
  styleUrls: ['./viaje-en-curso.page.scss'],
})
export class ViajeEnCursoPage implements OnInit {

  viaje: any;
  esPiloto: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.viaje = nav?.extras?.state?.['trip'];
    this.esPiloto = nav?.extras?.state?.['piloto'] || false;  
  }

  finalizarViaje() {
    this.router.navigate(['/home']);
  }

  cancelarViaje() {
    this.router.navigate(['/home']);
  }

  verHistorial() {
    if (this.esPiloto) {
      this.router.navigate(['/historial-viajes'], { state: { showPiloto: true } });
    } else {
      this.router.navigate(['/historial-viajes'], { state: { showPasajero: true } });
    }
  }
}
