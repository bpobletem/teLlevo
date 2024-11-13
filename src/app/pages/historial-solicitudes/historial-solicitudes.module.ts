import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialSolicitudesPageRoutingModule } from './historial-solicitudes-routing.module';

import { HistorialSolicitudesPage } from './historial-solicitudes.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialSolicitudesPageRoutingModule,
    ComponentsModule
],
  declarations: [HistorialSolicitudesPage]
})
export class HistorialSolicitudesPageModule {}
