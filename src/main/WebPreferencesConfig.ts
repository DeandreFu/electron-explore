import { WebPreferences } from 'electron';

export class WebPreferencesConfig implements WebPreferences {
  preload?: any;
  nodeIntegration = true;
  devTools = true;
  webSecurity = false;
  nodeIntegrationInSubFrames = true;
  nodeIntegrationInWorker = true;
  worldSafeExecuteJavaScript = true;
  contextIsolation = false;
  center = true;
  // webgl = false
  // disableHtmlFullscreenWindowResize = true
  // enableWebSQL = false
  // spellcheck = false
}
