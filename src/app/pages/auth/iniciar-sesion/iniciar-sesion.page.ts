/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/interfaces';
import { StorageService} from 'src/app/services/datos.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
})
export class IniciarSesionPage implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';

  firebaseSrv = inject(FirebaseService)

  constructor(private formBuilder: FormBuilder, private router: Router, private srv:StorageService,) {
    this.loginForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    
  }

  submit() {
    if (this.loginForm.valid) {
      this.firebaseSrv.signIn(this.loginForm.value as Usuario).then(res => {
        console.log("Usuario autenticado")
        console.log(res)
        this.router.navigate(['/home'])
      })
    }
  }
}
