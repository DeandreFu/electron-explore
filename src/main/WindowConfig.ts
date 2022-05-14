import { BrowserViewConstructorOptions } from 'electron';
import { WebPreferencesConfig } from './WebPreferencesConfig';

export class WindowConfig implements BrowserViewConstructorOptions {
  width?: number;
  height?: number;
  maximizable?: boolean;
  resizable?: boolean;
  x?: number;
  y?: number;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  frame = false;
  show = false;
  webPreferences = new WebPreferencesConfig();
  nodeIntegrationInSubFrames = true;
  nativeWindowOpen = true;
  modal?: any;
  parent?: any;
  movable = true;
  thickFrame = true;
  minHeight?: number;
  minWidth?: number;
}
