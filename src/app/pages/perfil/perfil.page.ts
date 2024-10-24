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

  ngOnInit(): void {
    
  }
}
