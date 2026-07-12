import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initThemeBeforeBootstrap } from './app/core/theme/theme-init';

initThemeBeforeBootstrap();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
