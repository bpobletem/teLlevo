import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevaPasswordPage } from './nueva-password.page';

const routes: Routes = [
  {
    path: '',
    component: NuevaPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevaPasswordPageRoutingModule {}
