import { NgModule } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

@NgModule({
	providers: [provideHttpClient(withFetch())]
})
export class AppModule {}