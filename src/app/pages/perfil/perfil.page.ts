import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  isLoggedIn = true

  ngOnInit() {
    this.cargarDatosPerfil();  
  }

  cargarDatosPerfil() {
    const datosGuardados = localStorage.getItem('perfilUsuario');
    if (datosGuardados) {
      this.user = JSON.parse(datosGuardados);
    }
  }

  logout() {
    localStorage.removeItem('userLoggedIn');
    this.isLoggedIn = false;
    this.router.navigate(['/iniciar-sesion']);
  }

  guardar() {
    localStorage.setItem('perfilUsuario', JSON.stringify(this.user));
    console.log('Perfil guardado:', this.user);
  }
}
