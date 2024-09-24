import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialViajesPageRoutingModule } from './historial-viajes-routing.module';

import { HistorialViajesPage } from './historial-viajes.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialViajesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [HistorialViajesPage]
})
export class HistorialViajesPageModule {}
