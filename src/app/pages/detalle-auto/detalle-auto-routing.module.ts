import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleAutoPage } from './detalle-auto.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleAutoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleAutoPageRoutingModule {}
