import { setDoc } from '@angular/fire/firestore';
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auto, Usuario } from 'src/app/interfaces/interfaces';
import { StorageService} from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
})
export class CrearUsuarioPage implements OnInit {

  usuario: Usuario = {
    uid: '',
    password: '',
    nombre: '',
    apellido: '',
    correo: '',
    esConductor: false
  }

  auto: Auto = {
    marca: '',
    modelo: '',
    patente: '',
    propietario: this.usuario
  }

  registrarForm: FormGroup;
  autoForm: FormGroup;
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  localStorageSrv = inject(StorageService);

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.registrarForm = this.formBuilder.group({
      uid: [''],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      esConductor: [false],
    });
    this.autoForm = this.formBuilder.group({
      modeloAuto: [''],
      marcaAuto: [''],
      colorAuto: [''],
      patenteAuto: ['']
    });
  }

  ngOnInit(): void {
    
  }

  async submit() {
    if (this.registrarForm.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();
      console.log('empezando el submit')
      await this.firebaseSrv.signUp(this.registrarForm.value as Usuario) 
        .then(async res => {
          console.log('esperando respuesta del signup')
          await this.firebaseSrv.updateUser(this.registrarForm.value.nombre);
          let uid = res.user.uid;
          this.registrarForm.controls['uid'].setValue(uid);
          this.setUser(uid);
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

  async setUser(uid: string) {
    if (this.registrarForm.valid) {
      console.log('seteando usuario')
      const loading = await this.utilsSrv.loading();
      await loading.present();

      let path = `Usuario/${uid}`;
      delete this.registrarForm.value.password;

      this.firebaseSrv.setDocument(path, this.registrarForm.value).then(async res => {
          this.localStorageSrv.set(uid, this.registrarForm.value);
          this.router.navigate(['/iniciar-sesion']);
          this.registrarForm.reset();
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
