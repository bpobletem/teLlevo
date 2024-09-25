import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViajeEnCursoPage } from './viaje-en-curso.page';

const routes: Routes = [
  {
    path: '',
    component: ViajeEnCursoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViajeEnCursoPageRoutingModule {}
