import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { SoldiersEffects } from './state-management/effects/soldiers.effects';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appReducers, metaReducers } from './state-management/reducers';
import { MissionsEffects } from './state-management/effects/missions.effects';
import { MetadataEffects } from './state-management/effects/metadata.effects';
import { UserEffects } from './state-management/effects/user.effects';
import { CustomSerializer } from './state-management/custom-router-serializer';
import { provideRouterStore } from '@ngrx/router-store';
import { authInterceptor } from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    // SECURITY: Register the JWT auth interceptor so every HTTP request
    // includes the Authorization: Bearer <token> header automatically.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), 
    provideClientHydration(), 
    provideAnimationsAsync(), 
    provideStore(appReducers, {metaReducers}),
    provideRouterStore({
      serializer: CustomSerializer
    }),
    provideEffects(SoldiersEffects),
    provideEffects(MissionsEffects),
    provideEffects(MetadataEffects),
    provideEffects(UserEffects)
  ]
};
