import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico';
import { TallerComponent } from './components/taller/taller';
import { SeguimientoComponent } from './components/seguimiento/seguimiento';
import { SeguimientoChatComponent } from './components/seguimiento/chat/chat';
import { SeguimientoDetalleComponent } from './components/seguimiento/detalle/seguimiento-detalle';
import { HistorialComponent } from './components/historial/historial';
import { ContactoComponent } from './components/contacto/contacto';
import { PerfilComponent } from './components/perfil/perfil';
import { MisVehiculosComponent } from './components/mis-vehiculos/mis-vehiculos';
import { LoginComponent } from './components/login/login';
import { seguimientoGuard } from './auth/seguimiento.guard';
import { adminGuard } from './auth/admin.guard';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';
import { authGuard } from './auth/auth.guard';
import { RegistroTallerComponent } from './components/registro-taller/registro-taller';
import { AdminComponent } from './admin/admin.component';
import { CambiarRolComponent } from './components/cambiar-rol/cambiar-rol';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'home', component: HomeComponent, canActivate: [authGuard] },
	{ path: 'diagnostico', component: DiagnosticoComponent, canActivate: [authGuard] },
	{ path: 'taller', component: TallerComponent, canActivate: [authGuard] },
	{ path: 'mecanico', loadComponent: () => import('./mecanico/mecanico.component').then((m) => m.MecanicoComponent), canActivate: [authGuard] },
	{
		path: 'usuario/seguimiento',
		component: SeguimientoComponent,
		canActivate: [seguimientoGuard],
		children: [
			{ path: 'detalle', component: SeguimientoDetalleComponent },
			{ path: 'chat', component: SeguimientoChatComponent }
		]
	},

	{ path: 'mecanico/seguimiento', loadComponent: () => import('./mecanico/seguimiento/seguimiento.component').then((m) => m.SeguimientoComponent), canActivate: [seguimientoGuard], children: [
		{ path: '', pathMatch: 'full', redirectTo: 'chat' },
		{ path: 'chat', loadComponent: () => import('./components/seguimiento/chat/chat').then((m) => m.SeguimientoChatComponent) }
	] },
	{ path: 'historial', component: HistorialComponent, canActivate: [authGuard] },
	{ path: 'contacto', component: ContactoComponent, canActivate: [authGuard] },
	{ path: 'perfil', component: PerfilComponent, canActivate: [authGuard], children: [
		{ path: '', pathMatch: 'full', redirectTo: 'informacion' },
		{ path: 'informacion', loadComponent: () => import('./components/perfil/informacion/informacion').then((m) => m.PerfilInformacionComponent) },
		{ path: 'seguridad', loadComponent: () => import('./components/perfil/seguridad/seguridad').then((m) => m.PerfilSeguridadComponent) },
		{ path: 'vehiculo', loadComponent: () => import('./components/perfil/vehiculo/vehiculo').then((m) => m.PerfilVehiculoComponent) },
		{ path: 'preferencias', loadComponent: () => import('./components/perfil/preferencias/preferencias').then((m) => m.PerfilPreferenciasComponent) }
	] },
	{ path: 'mis-vehiculos', component: MisVehiculosComponent, canActivate: [authGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'registro', component: LoginComponent },
	{ path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
	{ path: 'admin/contacto', loadComponent: () => import('./admin/admin-contacto/admin-contacto').then((m) => m.AdminContactoComponent), canActivate: [adminGuard] },
	{ path: 'sobre-nosotros', component: SobreNosotros },
	{ path: 'registro-taller', component: RegistroTallerComponent },
	{ path: 'privacidad', loadComponent: () => import('./components/privacidad/privacidad').then((m) => m.Privacidad) },
	{ path: 'cambiar-rol', component: CambiarRolComponent, canActivate: [authGuard] },

	{ path: '**', redirectTo: 'login' }
];
