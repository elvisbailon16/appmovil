import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./Pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./Pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'list-evento',
    loadComponent: () => import('./Pages/list-evento/list-evento.page').then( m => m.ListEventoPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./Pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'act-evento',
    loadComponent: () => import('./Pages/act-evento/act-evento.page').then( m => m.ActEventoPage)
  },
  {
    path: 'detalles-event',
    loadComponent: () => import('./Pages/detalles-event/detalles-event.page').then( m => m.DetallesEventPage)
  },
  {
    path: 'ponentes',
    loadComponent: () => import('./Pages/ponentes/ponentes.page').then( m => m.PonentesPage)
  },
  {
    path: 'qr',
    loadComponent: () => import('./Pages/qr/qr.page').then( m => m.QRPage)
  },
  {
    path: 'wallet-c',
    loadComponent: () => import('./Pages/wallet-c/wallet-c.page').then( m => m.WalletCPage)
  },
  {
    path: 'certificados',
    loadComponent: () => import('./Pages/certificados/certificados.page').then( m => m.CertificadosPage)
  },
  {
    path: 'certi',
    loadComponent: () => import('./Pages/certi/certi.page').then( m => m.CertiPage)
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./Pages/configuracion/configuracion.page').then( m => m.ConfiguracionPage)
  },
];
