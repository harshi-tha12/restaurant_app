import { Routes } from '@angular/router';

import { Home } from './features/customer/home/home';
import { Login } from './features/admin/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';

export const routes: Routes = [

  {
    path:'',
    component:Home
  },

  {
    path:'admin/login',
    component:Login
  },

  {
    path:'admin/dashboard',
    component:Dashboard
  },

  {
  path:'admin/dashboard',
  component:Dashboard
}

];