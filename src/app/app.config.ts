import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { SoldiersEffects } from './state-management/effects/soldiers.effects';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appReducers, metaReducers } from './state-management/reducers';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(withFetch()), 
    provideClientHydration(), 
    provideAnimationsAsync(), 
    provideStore(appReducers, {metaReducers}),
    provideEffects(SoldiersEffects)]
};
