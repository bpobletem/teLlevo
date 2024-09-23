/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restablecer-password',
  templateUrl: './restablecer-password.page.html',
  styleUrls: ['./restablecer-password.page.scss'],
})
export class RestablecerPasswordPage implements OnInit {

  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    const email = this.resetPasswordForm.get('email')?.value;

    let usuariosRegistrados = JSON.parse(localStorage.getItem('users') || '[]');

    const user = usuariosRegistrados.find((user: any) => user.email === email);

    if (user) {
      this.successMessage = 'Solicitud enviada. Revisa tu correo para restablecer tu contraseña.';
      this.errorMessage = '';

      setTimeout(() => {
        this.router.navigate(['/nueva-password', { email: email }]);
      }, 2000);

    } else {
      this.errorMessage = 'El correo ingresado no está registrado.';
      this.successMessage = '';
    }
  }
}
