import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico';
import { TallerComponent } from './components/taller/taller';
import { SeguimientoComponent } from './components/seguimiento/seguimiento';
import { SeguimientoChatComponent } from './components/seguimiento/chat/chat';
import { HistorialComponent } from './components/historial/historial';
import { ContactoComponent } from './components/contacto/contacto';
import { PerfilComponent } from './components/perfil/perfil';
import { MisVehiculosComponent } from './components/mis-vehiculos/mis-vehiculos';
import { LoginComponent } from './components/login/login';
import { seguimientoGuard } from './auth/seguimiento.guard';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';
import { authGuard } from './auth/auth.guard';
import { RegistroTallerComponent } from './components/registro-taller/registro-taller';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'home', component: HomeComponent },
	{ path: 'diagnostico', component: DiagnosticoComponent },
	{ path: 'taller', component: TallerComponent },
	{ path: 'mecanico', loadComponent: () => import('./mecanico/mecanico.component').then((m) => m.MecanicoComponent) },
	{
		path: 'usuario/seguimiento',
		component: SeguimientoComponent,
		canActivate: [seguimientoGuard],
		children: [
			{ path: 'chat', component: SeguimientoChatComponent }
		]
	},

	{ path: 'mecanico/seguimiento', loadComponent: () => import('./mecanico/seguimiento/seguimiento.component').then((m) => m.SeguimientoComponent), canActivate: [seguimientoGuard], children: [
		{ path: '', pathMatch: 'full', redirectTo: 'chat' },
		{ path: 'chat', loadComponent: () => import('./components/seguimiento/chat/chat').then((m) => m.SeguimientoChatComponent) }
	] },
	{ path: 'historial', component: HistorialComponent },
	{ path: 'contacto', component: ContactoComponent },
	{ path: 'perfil', component: PerfilComponent, canActivate: [authGuard], children: [
		{ path: '', pathMatch: 'full', redirectTo: 'informacion' },
		{ path: 'informacion', loadComponent: () => import('./components/perfil/informacion/informacion').then((m) => m.PerfilInformacionComponent) },
		{ path: 'seguridad', loadComponent: () => import('./components/perfil/seguridad/seguridad').then((m) => m.PerfilSeguridadComponent) },
		{ path: 'vehiculo', loadComponent: () => import('./components/perfil/vehiculo/vehiculo').then((m) => m.PerfilVehiculoComponent) },
		{ path: 'preferencias', loadComponent: () => import('./components/perfil/preferencias/preferencias').then((m) => m.PerfilPreferenciasComponent) }
	] },
	{ path: 'mis-vehiculos', component: MisVehiculosComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'registro', component: LoginComponent },
	{ path: 'sobre-nosotros', component: SobreNosotros },
	{ path: 'registro-taller', component: RegistroTallerComponent },

	{ path: '**', redirectTo: 'login' }
];
