import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesDeViajePage } from './solicitudes-de-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesDeViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudesDeViajePageRoutingModule {}
