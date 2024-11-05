/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { StorageService } from './../../../services/storage.service';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
})
export class IniciarSesionPage implements OnInit {

  correo = '';
  password = '';

  form: FormGroup;
  errorMessage: string = '';

  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService)

  constructor(private formBuilder: FormBuilder, private router: Router, private srv: StorageService,) {
    this.form = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      this.firebaseSrv.signIn(this.form.value as Usuario).then(res => {
        this.getUser(res.user.uid);
        this.router.navigate(['/home']);
      }).catch(error => {
        this.utilsSrv.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'bottom',
          icon: 'alert-circle-outline'
        })
        console.log(error)
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async getUser(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      let path = `Usuario/${uid}`;

      this.firebaseSrv.getDocument(path).then( (user: Usuario) => {
          this.localStorageSrv.set('sesion', uid);
          this.router.navigate(['/home']);
          this.form.reset();

          this.utilsSrv.presentToast({
            message: `Bienvenido, ${user.nombre}`,
            duration: 1500,
            color: 'primary',
            position: 'bottom',
            icon: 'person-circle-outline'
          });
        }).catch(error => {
          this.utilsSrv.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
          console.log(error);
        }).finally(() => {
          loading.dismiss();
        });
    }
  }
}
