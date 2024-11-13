import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'buscar-viaje',
    loadChildren: () => import('./pages/buscar-viaje/buscar-viaje.module').then( m => m.BuscarViajePageModule)
  },
  {
    path: 'crear-viaje',
    loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then( m => m.CrearViajePageModule)
  },
  {
    path: 'crear-usuario',
    loadChildren: () => import('./pages/auth/crear-usuario/crear-usuario.module').then( m => m.CrearUsuarioPageModule)
  },
  {
    path: 'iniciar-sesion',
    loadChildren: () => import('./pages/auth/iniciar-sesion/iniciar-sesion.module').then( m => m.IniciarSesionPageModule)
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'restablecer-password',
    loadChildren: () => import('./pages/auth/restablecer-password/restablecer-password.module').then( m => m.RestablecerPasswordPageModule)
  },
  {
    path: 'nueva-password',
    loadChildren: () => import('./pages/auth/nueva-password/nueva-password.module').then( m => m.NuevaPasswordPageModule)
  },
  {
    path: 'historial-viajes',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/historial-viajes/historial-viajes.module').then( m => m.HistorialViajesPageModule)
  },
  {
    path: 'registrar-auto',
    loadChildren: () => import('./pages/registrar-auto/registrar-auto.module').then( m => m.RegistrarAutoPageModule)
  },
  {
    path: 'listar-autos',
    loadChildren: () => import('./pages/listar-autos/listar-autos.module').then( m => m.ListarAutosPageModule)
  },
  {
    path: 'viaje-en-curso',
    loadChildren: () => import('./pages/viaje-en-curso/viaje-en-curso.module').then( m => m.ViajeEnCursoPageModule)
  },
  {
    path: 'solicitudes-de-viaje',
    loadChildren: () => import('./pages/solicitudes-de-viaje/solicitudes-de-viaje.module').then( m => m.SolicitudesDeViajePageModule)
  },
  {
    path: 'detalle-viaje',
    loadChildren: () => import('./pages/detalle-viaje/detalle-viaje.module').then( m => m.DetalleViajePageModule)
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./pages/editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  },
  {
    path: 'detalle-auto',
    loadChildren: () => import('./pages/detalle-auto/detalle-auto.module').then( m => m.DetalleAutoPageModule)
  },  {
    path: 'historial-solicitudes',
    loadChildren: () => import('./pages/historial-solicitudes/historial-solicitudes.module').then( m => m.HistorialSolicitudesPageModule)
  },
  {
    path: 'detalle-solicitud',
    loadChildren: () => import('./pages/detalle-solicitud/detalle-solicitud.module').then( m => m.DetalleSolicitudPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
