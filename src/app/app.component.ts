import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  correo = "";
  password = "";

  constructor(private router: Router) {}

  home() {
    this.router.navigate(['/home']);
  }
  perfil() {
    this.router.navigate(['/perfil']);
  }
  viajes() {
    this.router.navigate(['/historial-viajes']);
  }
}
