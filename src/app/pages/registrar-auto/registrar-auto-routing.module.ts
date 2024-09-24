import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarAutoPage } from './registrar-auto.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarAutoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarAutoPageRoutingModule {}
