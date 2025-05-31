import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes that can be prerendered
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'salon',
    renderMode: RenderMode.Prerender
  },
  // Salon with gameType parameter - prerender common game types
  {
    path: 'salon/:gameType',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Return the valid game types from your salon component
      return [
        { gameType: 'general' },
        { gameType: 'roulette' },
        { gameType: 'machine' }
      ];
    }
  },
  // Roulette redirects
  {
    path: 'Roulette',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes that require authentication - use client-side rendering
  {
    path: 'roulette-game/:sessionId',
    renderMode: RenderMode.Client
  },
  {
    path: 'machine',
    renderMode: RenderMode.Client
  },
  {
    path: 'stats',
    renderMode: RenderMode.Client
  },
  {
    path: 'balance',
    renderMode: RenderMode.Client
  },
  {
    path: 'compte',
    renderMode: RenderMode.Client
  },
  // Fallback for all other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
