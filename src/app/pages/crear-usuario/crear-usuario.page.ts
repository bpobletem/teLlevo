/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
})
export class CrearUsuarioPage implements OnInit {

  registrarForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,  
    private alertController: AlertController  
  ) {
    this.registrarForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registrarForm.valid) {
      const nuevoUsuario = this.registrarForm.value;

      let usuariosRegistrados = JSON.parse(localStorage.getItem('users') || '[]');

      const userExists = usuariosRegistrados.find((user: any) => user.email === nuevoUsuario.email);

      if (userExists) {
        this.errorMessage = 'Ya existe una cuenta con este correo electrónico.';
        this.successMessage = '';
      } else {
        usuariosRegistrados.push(nuevoUsuario);
        localStorage.setItem('users', JSON.stringify(usuariosRegistrados));

        this.errorMessage = '';
        this.successMessage = 'Cuenta creada exitosamente.';

        await this.showSuccessAlert();
      }
    } else {
      this.errorMessage = 'Por favor, rellene el formulario correctamente.';
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Cuenta creada exitosamente.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/iniciar-sesion']);
        }
      }]
    });

    await alert.present();
  }

  ngOnInit() {}

}
