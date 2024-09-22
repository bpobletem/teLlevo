import { EncabezadoComponent } from './encabezado/encabezado.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [EncabezadoComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports:[EncabezadoComponent]
})
export class ComponentsModule { }