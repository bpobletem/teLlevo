import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleViajePageRoutingModule } from './detalle-viaje-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { DetalleViajePage } from './detalle-viaje.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleViajePageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [DetalleViajePage]
})
export class DetalleViajePageModule {}
