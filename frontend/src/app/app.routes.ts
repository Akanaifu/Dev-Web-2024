import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';
import { MachineASousComponent } from './pages/machine-a-sous/machine-a-sous.component';
import { StatsComponent } from './pages/stats/stats.component';
import { RouletteNetComponent } from './pages/roulette-net/roulette-net.component';

import { EditCompteComponent } from './pages/edit-compte/edit-compte.component';

import { BalanceComponent } from './pages/balance/balance.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    //  canActivate: [isLoggedInGuard],
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'machine',
    component: MachineASousComponent,
    canActivate: [isLoggedInGuard],
  }, // page de la machine à sous

  {
    //page de la roulette
    path: 'Roulette',
    component: RouletteNetComponent,
    canActivate: [isLoggedInGuard],
  },
  {
    path: 'stats',
    component: StatsComponent,
    canActivate: [isLoggedInGuard],
  }, // page de stats
  {
    path: 'balance',
    component: BalanceComponent,
    canActivate: [isLoggedInGuard],
  }, // page de solde
  {
    path: 'compte',
    component: EditCompteComponent,
    canActivate: [isLoggedInGuard],
  },
  { path: '**', component: NotFoundComponent },
  // page d'erreur route inexistante. A mettre à la fin !!!!!!!!
];
