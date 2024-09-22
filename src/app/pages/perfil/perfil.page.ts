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

  guardar() {
    // Aquí puedes agregar la lógica para guardar los datos del perfil
    console.log('Perfil guardado:', this.user);
  }

  ngOnInit() {}

}
