import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  isLoggedIn = false;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    this.isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  }

  logout() {
    localStorage.removeItem('userLoggedIn');
    this.isLoggedIn = false;
    this.router.navigate(['/iniciar-sesion']);
  }
  
  //Hacer uso de los datos guardados con localStorage da problemas con ngOnInit. El método de arriba funciona, así que se usará por ahora.
  //   isLoggedIn = false;

//   constructor(private router: Router) {}

//   ngOnInit() {
//     this.isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
//   }

//   logout() {
//     localStorage.removeItem('userLoggedIn');
//     this.isLoggedIn = false;
//     this.router.navigate(['/iniciar-sesion']); 
//   }
}

