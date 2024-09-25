import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitudesDeViajePageRoutingModule } from './solicitudes-de-viaje-routing.module';

import { SolicitudesDeViajePage } from './solicitudes-de-viaje.page';

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SolicitudesDeViajePageRoutingModule
  ],
  declarations: [SolicitudesDeViajePage]
})
export class SolicitudesDeViajePageModule {}
