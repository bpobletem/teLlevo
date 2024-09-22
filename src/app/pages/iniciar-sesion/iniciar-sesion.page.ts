/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
})
export class IniciarSesionPage implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;

      let usuariosRegistrados = JSON.parse(localStorage.getItem('users') || '[]');

      const user = usuariosRegistrados.find((user: any) =>
        user.email === credentials.email && user.password === credentials.password
      );

      if (user) {
        localStorage.setItem('userLoggedIn', 'true');
        this.errorMessage = '';
        this.router.navigate(['/home']); 
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    }
  }

  ngOnInit() {
  }

}
