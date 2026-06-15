import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  HomeOutline,
  ContactsOutline,
  ClusterOutline,
  ProfileOutline,
  BarChartOutline,
  BellOutline,
  LogoutOutline,
  SettingOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

const ICONS = [
  HomeOutline,
  ContactsOutline,
  ClusterOutline,
  ProfileOutline,
  BarChartOutline,
  BellOutline,
  LogoutOutline,
  SettingOutline,
  UserOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNzI18n(es_ES),
    provideNzIcons(ICONS),
  ],
};
