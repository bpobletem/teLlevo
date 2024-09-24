import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registrar-auto',
  templateUrl: './registrar-auto.page.html',
  styleUrls: ['./registrar-auto.page.scss'],
})
export class RegistrarAutoPage implements OnInit {
  autoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.autoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      patente: ['', [Validators.required]]
    });
  }

  submitAuto() {
    if (this.autoForm.valid) {
      const autoData = this.autoForm.value;
      console.log('Auto registrado:', autoData);

    } else {
      console.log('Formulario inválido');
    }
  }

  ngOnInit() {}

}
