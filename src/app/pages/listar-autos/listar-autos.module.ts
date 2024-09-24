import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarAutosPageRoutingModule } from './listar-autos-routing.module';

import { ListarAutosPage } from './listar-autos.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarAutosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ListarAutosPage]
})
export class ListarAutosPageModule {}
