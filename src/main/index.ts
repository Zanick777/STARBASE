import { app, BrowserWindow, ipcMain, shell, net } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FEEDS, parseFeed, mergeItems, FeedSource } from '../shared/feeds';
import { DEFAULT_LINKS, sanitizeLinks } from '../shared/links';
import { isAllowedExternal } from '../shared/util';
import type { SourceStatus, FeedResult, NewsItem, QuickLink } from '../shared/types';

const UA = 'STARBASE/1.0 (+desktop news reader)';
const linksFile = () => path.join(app.getPath('userData'), 'quicklinks.json');

async function fetchText(url: string, timeoutMs = 12000): Promise<string> {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await net.fetch(url, { signal: ctl.signal, headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(t); }
}

async function fetchHN(src: FeedSource): Promise<NewsItem[]> {
  const ids: number[] = JSON.parse(await fetchText(src.url)).slice(0, 40);
  const items = await Promise.all(ids.map(async (id) => {
    try { return JSON.parse(await fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, 8000)); } catch { return null; }
  }));
  return items.filter((i) => i && i.title).map((i) => ({
    id: `hn-${i.id}`, title: i.title, source: 'Hacker News', sourceUrl: `https://news.ycombinator.com/item?id=${i.id}`, published: i.time * 1000,
    url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
  }));
}

let cache: FeedResult | null = null;
async function getNews(): Promise<FeedResult> {
  const errors: FeedResult['errors'] = [];
  const sources: SourceStatus[] = [];
  const results = await Promise.all(FEEDS.map(async (f) => {
    const t0 = Date.now();
    try {
      const items = f.kind === 'hn' ? await fetchHN(f) : parseFeed(await fetchText(f.url), f.name, f.home).sort((a, b) => b.published - a.published).slice(0, 25);
      sources.push({ name: f.name, ok: true, count: items.length, ms: Date.now() - t0 }); return items;
    } catch (e) {
      const error = (e as Error).message || String(e);
      errors.push({ source: f.name, error }); sources.push({ name: f.name, ok: false, count: 0, ms: Date.now() - t0, error }); return [];
    }
  }));
  sources.sort((a, b) => FEEDS.findIndex((f) => f.name === a.name) - FEEDS.findIndex((f) => f.name === b.name));
  const items = mergeItems(results);
  const offline = items.length === 0 && errors.length === FEEDS.length;
  if (offline && cache) return { ...cache, errors, sources, offline: true };
  cache = { items, errors, fetchedAt: Date.now(), offline, sources };
  return cache;
}

async function getLinks(): Promise<QuickLink[]> {
  try { return sanitizeLinks(JSON.parse(await fs.readFile(linksFile(), 'utf8'))) ?? DEFAULT_LINKS; }
  catch { return DEFAULT_LINKS; }
}
async function saveLinks(v: unknown): Promise<QuickLink[]> {
  const links = sanitizeLinks(v); if (!links) throw new Error('invalid links');
  await fs.mkdir(path.dirname(linksFile()), { recursive: true });
  const tmp = linksFile() + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(links, null, 2)); await fs.rename(tmp, linksFile());
  return links;
}
async function openExternal(url: unknown): Promise<boolean> {
  if (typeof url !== 'string' || !isAllowedExternal(url)) return false;
  await shell.openExternal(url); return true;
}
async function launchSpotify(): Promise<'app' | 'web'> {
  try { await shell.openExternal('spotify:'); return 'app'; }
  catch { await shell.openExternal('https://open.spotify.com'); return 'web'; }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1000, minHeight: 640, backgroundColor: '#000000',
    title: 'STARBASE', icon: path.join(__dirname, '../../dist/icon.png'), autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { void openExternal(url); return { action: 'deny' }; });
  const dev = process.env.VITE_DEV_SERVER_URL;
  const indexPath = path.join(__dirname, '../../dist/index.html');
  const allowedOrigin = dev ?? `file://${indexPath}`;
  win.webContents.on('will-navigate', (e, url) => {
    const isOwnEntry = url === allowedOrigin || (!dev && url.startsWith('file://') && url.includes('/dist/index.html'));
    if (!isOwnEntry) { e.preventDefault(); void openExternal(url); }
  });
  if (dev) void win.loadURL(dev); else void win.loadFile(indexPath);
  if (process.env.STARBASE_SCREENSHOT && !app.isPackaged) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      if (process.env.STARBASE_SCREENSHOT_JS) { await win.webContents.executeJavaScript(process.env.STARBASE_SCREENSHOT_JS); await new Promise((r) => setTimeout(r, 1500)); }
      const img = await win.webContents.capturePage();
      await fs.writeFile(process.env.STARBASE_SCREENSHOT!, img.toPNG()); app.quit();
    }, Number(process.env.STARBASE_SCREENSHOT_DELAY || 15000)));
  }
}

function validateSender(e: Electron.IpcMainInvokeEvent): boolean {
  const win = BrowserWindow.fromWebContents(e.sender);
  return win !== null && !e.sender.isDestroyed();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    app.on('web-contents-created', (_e, contents) => {
      contents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
      contents.session.setPermissionCheckHandler(() => false);
    });

    ipcMain.handle('news:get', (e) => validateSender(e) ? getNews() : null);
    ipcMain.handle('links:get', (e) => validateSender(e) ? getLinks() : null);
    ipcMain.handle('links:save', (e, v) => validateSender(e) ? saveLinks(v) : null);
    ipcMain.handle('open:external', (e, url) => validateSender(e) ? openExternal(url) : false);
    ipcMain.handle('spotify:launch', (e) => validateSender(e) ? launchSpotify() : null);
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
