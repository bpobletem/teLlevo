/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-restablecer-password',
  templateUrl: './restablecer-password.page.html',
  styleUrls: ['./restablecer-password.page.scss'],
})
export class RestablecerPasswordPage implements OnInit {

  correo = '';

  form: FormGroup;

  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService)

  constructor(private formBuilder: FormBuilder, private router: Router, private srv: StorageService,) {
    this.form = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      this.firebaseSrv.sendRecoveryEmail(this.form.value.correo).then(res => {
        this.utilsSrv.presentToast({
          message: 'El correo de recuperación ha sido enviado',
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'alert-circle-outline'
        })
        this.router.navigate(['/home']);
        this.form.reset();
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

}
