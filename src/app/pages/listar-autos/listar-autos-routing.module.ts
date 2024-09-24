import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarAutosPage } from './listar-autos.page';

const routes: Routes = [
  {
    path: '',
    component: ListarAutosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListarAutosPageRoutingModule {}
