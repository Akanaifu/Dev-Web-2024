import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes publiques - peuvent être pré-rendues
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  
  // Routes protégées - rendu côté client uniquement
  {
    path: 'machine',
    renderMode: RenderMode.Client
  },
  {
    path: 'stats',
    renderMode: RenderMode.Client
  },
  {
    path: 'compte',
    renderMode: RenderMode.Client
  },
  
  // Route catch-all
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];