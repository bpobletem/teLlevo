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
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      rut: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      comuna: ['', [Validators.required]],
      esConductor: [false], 
      modeloAuto: [''],
      colorAuto: [''],
      patenteAuto: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registrarForm.get('esConductor')?.valueChanges.subscribe((esConductor) => {
      this.toggleConductorFields(esConductor);
    });
  }

  toggleConductorFields(esConductor: boolean) {
    if (esConductor) {
      this.registrarForm.get('modeloAuto')?.setValidators([Validators.required]);
      this.registrarForm.get('colorAuto')?.setValidators([Validators.required]);
      this.registrarForm.get('patenteAuto')?.setValidators([Validators.required]);
    } else {
      this.registrarForm.get('modeloAuto')?.clearValidators();
      this.registrarForm.get('colorAuto')?.clearValidators();
      this.registrarForm.get('patenteAuto')?.clearValidators();
    }

    this.registrarForm.get('modeloAuto')?.updateValueAndValidity();
    this.registrarForm.get('colorAuto')?.updateValueAndValidity();
    this.registrarForm.get('patenteAuto')?.updateValueAndValidity();
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

        localStorage.setItem('perfilUsuario', JSON.stringify(nuevoUsuario));

        this.errorMessage = '';
        this.successMessage = '';
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
