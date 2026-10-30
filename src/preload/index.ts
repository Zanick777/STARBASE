import { contextBridge, ipcRenderer } from 'electron';
import type { StarbaseApi } from '../shared/types';
const api: StarbaseApi = {
  getNews: () => ipcRenderer.invoke('news:get'),
  getLinks: () => ipcRenderer.invoke('links:get'),
  saveLinks: (links) => ipcRenderer.invoke('links:save', links),
  openExternal: (url) => ipcRenderer.invoke('open:external', url),
  launchSpotify: () => ipcRenderer.invoke('spotify:launch'),
};
contextBridge.exposeInMainWorld('starbase', api);
