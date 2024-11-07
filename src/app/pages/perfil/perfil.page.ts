import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);

  user = {
    nombre: '',
    apellido: '',
    rut: '',
    direccion: '',
    comuna: '',
    modeloAuto: '',
    colorAuto: '',
    patenteAuto: ''
  };

  constructor(private router: Router) {}

  signOut() {
    this.firebaseSrv.signOut();
    this.utilsSrv.presentToast({
      message: "Sesión cerrada con éxito",
      duration: 2500,
      color: 'primary',
      position: 'bottom',
      icon: 'alert-circle-outline'
    })
  }

  ngOnInit(): void {
    
  }
}
