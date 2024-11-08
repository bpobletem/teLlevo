import { EncabezadoComponent } from './encabezado/encabezado.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MapComponent } from './map/map.component';


@NgModule({
  declarations: [EncabezadoComponent, MapComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports:[EncabezadoComponent, MapComponent], 
})
export class ComponentsModule { }