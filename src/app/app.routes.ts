import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Radar Útil | Inicio', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'explorar', title: 'Radar Útil | Explorar', loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent) },
  { path: 'detalle/:id', title: 'Radar Útil | Detalle', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
  { path: 'favoritos', title: 'Radar Útil | Favoritos', loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent) },
  { path: 'publicar', title: 'Radar Útil | Publicar', loadComponent: () => import('./pages/publish/publish.component').then(m => m.PublishComponent) },
  { path: 'contacto', title: 'Radar Útil | Contacto', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: '**', redirectTo: '' }
];
