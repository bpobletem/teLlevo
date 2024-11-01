import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearUsuarioPageRoutingModule } from './crear-usuario-routing.module';

import { CrearUsuarioPage } from './crear-usuario.page';
import { ComponentsModule } from "../../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CrearUsuarioPageRoutingModule,
    ComponentsModule
],
  declarations: [CrearUsuarioPage]
})
export class CrearUsuarioPageModule {}
