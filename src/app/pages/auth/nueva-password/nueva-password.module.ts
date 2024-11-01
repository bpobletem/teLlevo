import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaPasswordPageRoutingModule } from './nueva-password-routing.module';

import { NuevaPasswordPage } from './nueva-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NuevaPasswordPageRoutingModule
  ],
  declarations: [NuevaPasswordPage]
})
export class NuevaPasswordPageModule {}
