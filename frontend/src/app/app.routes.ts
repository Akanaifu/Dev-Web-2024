import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { JeuxComponent } from './pages/jeux/jeux.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';
import { MachineASousComponent } from './pages/machine-a-sous/machine-a-sous.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'jeux',
    component: JeuxComponent,
     //canActivate: [isLoggedInGuard],
  },
  {
    path: 'machine',
    component: MachineASousComponent,
     //canActivate: [isLoggedInGuard],
  }, // page de la machine à sous
  { path: '**', component: NotFoundComponent }, // page d'erreur route inexistante. A mettre à la fin !!!!!!!!
];
