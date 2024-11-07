import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auto } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-registrar-auto',
  templateUrl: './registrar-auto.page.html',
  styleUrls: ['./registrar-auto.page.scss'],
})
export class RegistrarAutoPage implements OnInit {
  storageSrv = inject(StorageService);
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);
  router = inject(Router);
  userUid = '';

  autoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicializamos el formulario con los validadores correctamente configurados
    this.autoForm = this.fb.group({
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', Validators.required],
      patente: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      propietario: ['']  // Se actualizará en ngOnInit
    });
  }

  async ngOnInit() { 
    this.userUid = await this.storageSrv.get('sesion');
  }

  async saveAuto() {
    if (this.autoForm.valid) {
      const path = `Auto/${this.autoForm.value.patente}`;
      try {
        this.autoForm.value.propietario = `Usuario/${this.userUid}`;
        await this.firebaseSrv.setDocument(path, this.autoForm.value);
        
        this.autoForm.reset();
        this.router.navigate(['/listar-autos']);
        
        this.utilsSrv.presentToast({
          message: 'Auto registrado con éxito.',
          duration: 2500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
      } catch (error) {
        this.utilsSrv.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
        console.error(error);
      }
    } else {
      this.utilsSrv.presentToast({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 1500,
        color: 'warning',
        position: 'bottom',
        icon: 'warning-outline'
      });
    }
  }
}
