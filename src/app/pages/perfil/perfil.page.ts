import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

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

  constructor() {}

  ngOnInit() {
    this.cargarDatosPerfil();  
  }

  cargarDatosPerfil() {
    const datosGuardados = localStorage.getItem('perfilUsuario');
    if (datosGuardados) {
      this.user = JSON.parse(datosGuardados);
    }
  }

  guardar() {
    localStorage.setItem('perfilUsuario', JSON.stringify(this.user));
    console.log('Perfil guardado:', this.user);
  }
}
