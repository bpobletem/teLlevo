import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarAutoPageRoutingModule } from './registrar-auto-routing.module';

import { RegistrarAutoPage } from './registrar-auto.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarAutoPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [RegistrarAutoPage]
})
export class RegistrarAutoPageModule {}
