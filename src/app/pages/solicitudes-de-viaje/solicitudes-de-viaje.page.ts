import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SolicitudesViaje } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-solicitudes-viaje',
  templateUrl: './solicitudes-de-viaje.page.html',
  styleUrls: ['./solicitudes-de-viaje.page.scss'],
})
export class SolicitudesDeViajePage implements OnInit {

  viajeId: string = '';
  solicitudes: SolicitudesViaje[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private firebaseSrv: FirebaseService) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation()?.extras.state;
    if (navigation && navigation['viajeId']) {
      this.viajeId = navigation['viajeId'];
      console.log('Viaje ID recibido en SolicitudesDeViajePage:', this.viajeId);
      this.cargarSolicitudes();
    } else {
      console.error('No se recibió el viajeId en NavigationExtras');
    }
  }

  cargarSolicitudes() {
    this.firebaseSrv.getCollectionChanges<SolicitudesViaje>('SolicitudesViajes').subscribe((solicitudes) => {
      console.log('Todas las solicitudes obtenidas:', solicitudes); // Verifica el contenido completo de las solicitudes obtenidas
      
      this.solicitudes = solicitudes.filter(solicitud => {
        console.log('Comparando viajeId:', solicitud.viajeId, 'con', this.viajeId);
        return solicitud.viajeId === this.viajeId && solicitud.estado === 'pendiente';
      });
      
      console.log('Solicitudes filtradas:', this.solicitudes);
    });
  }
  
}