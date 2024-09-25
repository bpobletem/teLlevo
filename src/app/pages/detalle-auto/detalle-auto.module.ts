import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleAutoPageRoutingModule } from './detalle-auto-routing.module';

import { DetalleAutoPage } from './detalle-auto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleAutoPageRoutingModule
  ],
  declarations: [DetalleAutoPage]
})
export class DetalleAutoPageModule {}
