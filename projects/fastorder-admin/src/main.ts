import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeEsPe, 'es-PE');
bootstrapApplication(App, appConfig).catch((err) => console.error(err));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch((error: unknown) => {
    console.error('No se pudo registrar FastOrder Admin sin conexión.', error);
  });
}
