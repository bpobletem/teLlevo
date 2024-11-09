import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auto, Usuario } from 'src/app/interfaces/interfaces';
import { StorageService } from 'src/app/services/storage.service';
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
  };

  auto: Auto = {
    marca: '',
    modelo: '',
    patente: '',
    propietario: ''
  };

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
      propietario: [''],
      modelo: ['', Validators.required],
      marca: ['', Validators.required],
      patente: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  async submit() {
    if (this.registrarForm.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      // Crear usuario en Firebase
      await this.firebaseSrv.signUp(this.registrarForm.value as Usuario)
        .then(async res => {
          let uid = res.user.uid;
          this.registrarForm.controls['uid'].setValue(uid);
          // Si el usuario seleccionó "Quiero ser conductor", guardar auto
          const esConductor = this.registrarForm.get('esConductor')?.value;
          await this.setUser(uid); // Guardar datos del usuario en Firestore
          if (esConductor) {
            this.autoForm.controls['propietario'].setValue(`Usuario/${uid}`);
            await this.saveAuto(uid);
          }

          this.router.navigate(['/iniciar-sesion']);
        })
        .catch(error => {
          this.utilsSrv.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
          console.log(error);
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async setUser(uid: string) {
    if (this.registrarForm.valid) {
      const loading = await this.utilsSrv.loading();
      await loading.present();

      let path = `Usuario/${uid}`;
      delete this.registrarForm.value.password;

      await this.firebaseSrv.setDocument(path, this.registrarForm.value)
        .then(() => {
          this.localStorageSrv.set(uid, this.registrarForm.value);
          this.registrarForm.reset();
        })
        .catch(error => {
          this.utilsSrv.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
          console.log(error);
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async saveAuto(uid: string) {
    if (this.autoForm.valid) {
      let path = `Auto/${this.autoForm.value.patente}`;
      await this.firebaseSrv.setDocument(path, this.autoForm.value)
        .then(() => {
          this.autoForm.reset();
        })
        .catch(error => {
          this.utilsSrv.presentToast({
            message: error.message,
            duration: 2500,
            color: 'danger',
            position: 'bottom',
            icon: 'alert-circle-outline'
          });
          console.log(error);
        });
    }
  }
}
