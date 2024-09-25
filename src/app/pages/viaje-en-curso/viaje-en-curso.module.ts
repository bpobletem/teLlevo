import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViajeEnCursoPageRoutingModule } from './viaje-en-curso-routing.module';

import { ViajeEnCursoPage } from './viaje-en-curso.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViajeEnCursoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ViajeEnCursoPage]
})
export class ViajeEnCursoPageModule {}
