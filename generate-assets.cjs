const { spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const WebSocket = require('ws');

const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome';

const apps = [
  {
    dir: 'apps/mobile/assets',
    androidDir: 'apps/mobile/android/app/src/main/res',
    title: 'Naploo',
    subtitle: 'Hotels, pods and stays',
    initial: 'N',
    background: '#10243f',
    deep: '#0b1526',
    accent: '#2dd4bf',
    accent2: '#f7c948',
  },
  {
    dir: 'apps/partner/assets',
    androidDir: 'apps/partner/android/app/src/main/res',
    title: 'Naploo Partner',
    subtitle: 'Property operations',
    initial: 'P',
    background: '#163b45',
    deep: '#101b2a',
    accent: '#ffb85c',
    accent2: '#38d9a9',
  },
];

const launcherDensities = [
  ['mipmap-mdpi', 48, 108],
  ['mipmap-hdpi', 72, 162],
  ['mipmap-xhdpi', 96, 216],
  ['mipmap-xxhdpi', 144, 324],
  ['mipmap-xxxhdpi', 192, 432],
];

const splashDensities = [
  ['drawable-mdpi', 200],
  ['drawable-hdpi', 300],
  ['drawable-xhdpi', 400],
  ['drawable-xxhdpi', 600],
  ['drawable-xxxhdpi', 800],
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function findPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(process) {
  return new Promise((resolve) => {
    if (process.exitCode !== null) {
      resolve();
      return;
    }
    process.once('exit', resolve);
  });
}

async function removeTempDir(tempDir) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 9) throw error;
      await wait(150);
    }
  }
}

async function waitForDebugger(port) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const pages = await getJson(`http://127.0.0.1:${port}/json/list`);
      const page = pages.find((entry) => entry.type === 'page' && entry.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch (_) {
      await wait(100);
    }
  }
  throw new Error('Timed out waiting for Chrome DevTools');
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    this.ws = new WebSocket(url);
    this.ws.on('message', (message) => {
      const payload = JSON.parse(message.toString());
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        if (payload.error) reject(new Error(payload.error.message));
        else resolve(payload.result);
        return;
      }
      if (payload.method && this.events.has(payload.method)) {
        for (const resolve of this.events.get(payload.method)) resolve(payload.params);
        this.events.delete(payload.method);
      }
    });
  }

  open() {
    return new Promise((resolve, reject) => {
      this.ws.once('open', resolve);
      this.ws.once('error', reject);
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const request = { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(request));
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const listeners = this.events.get(method) ?? [];
      listeners.push(resolve);
      this.events.set(method, listeners);
    });
  }

  close() {
    this.ws.close();
  }
}

async function render(html, output, width, height, transparent = false) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naploo-assets-'));
  const htmlFile = path.join(tempDir, 'asset.html');
  const port = await findPort();
  fs.writeFileSync(htmlFile, html);

  const chromeProcess = require('child_process').spawn(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(tempDir, 'profile')}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let client;
  try {
    const wsUrl = await waitForDebugger(port);
    client = new CdpClient(wsUrl);
    await client.open();
    await client.send('Page.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: height,
    });
    await client.send('Emulation.setDefaultBackgroundColorOverride', transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
    const loaded = client.once('Page.loadEventFired');
    await client.send('Page.navigate', { url: `file://${htmlFile}` });
    await loaded;
    await wait(150);
    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));
  } finally {
    if (client) client.close();
    chromeProcess.kill('SIGTERM');
    await waitForExit(chromeProcess);
    await removeTempDir(tempDir);
  }
}

function renderWithCli(html, output, width, height, transparent = false) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naploo-assets-'));
  const htmlFile = path.join(tempDir, 'asset.html');
  fs.writeFileSync(htmlFile, html);
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--screenshot=${output}`,
    `file://${htmlFile}`,
  ];
  if (transparent) args.splice(4, 0, '--default-background-color=00000000');

  const result = spawnSync(chrome, args, { stdio: 'inherit' });
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`Chrome failed while rendering ${output}`);
}

function logoMarkup(app, size, compact = false, variant = 'splash') {
  const isLauncherForeground = variant === 'adaptive' || variant === 'nativeForeground';
  const isSplashLogo = variant === 'nativeSplash';
  const markSize = compact
    ? Math.round(size * 0.68)
    : isLauncherForeground
      ? Math.round(size * 0.74)
      : isSplashLogo
        ? Math.round(size * 0.72)
        : Math.round(size * 0.48);
  const radius = Math.round(markSize * 0.22);
  const fontSize = compact
    ? Math.round(size * 0.45)
    : isLauncherForeground || isSplashLogo
      ? Math.round(size * 0.46)
      : Math.round(size * 0.28);
  return `<div class="brand-wrap">
    <div class="mark" style="--mark-size:${markSize}px;--mark-radius:${radius}px;--font-size:${fontSize}px">
      <div class="roof"></div>
      <div class="initial">${escapeHtml(app.initial)}</div>
    </div>
    <div class="copy">
      <div class="title">${escapeHtml(app.title)}</div>
      <div class="subtitle">${escapeHtml(app.subtitle)}</div>
    </div>
  </div>`;
}

function styles(app, size, variant) {
  const showCopy = variant === 'splash';
  const titleSize = Math.round(size * 0.088);
  const subtitleSize = Math.round(size * 0.034);
  return `<style>
    * { box-sizing: border-box; }
    html, body { width: ${size}px; height: ${size}px; margin: 0; overflow: hidden; }
    body {
      display: grid;
      place-items: center;
      background: transparent;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .brand-wrap { display: grid; place-items: center; transform: translateY(${showCopy ? -10 : 0}px); }
    .mark {
      position: relative;
      width: var(--mark-size);
      height: var(--mark-size);
      border-radius: var(--mark-radius);
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 28% 24%, rgba(255,255,255,.36), transparent 26%),
        linear-gradient(145deg, ${app.accent}, ${app.accent2});
      box-shadow: 0 ${Math.round(size * 0.035)}px ${Math.round(size * 0.1)}px rgba(0,0,0,.32), inset 0 0 0 ${Math.max(2, Math.round(size * 0.012))}px rgba(255,255,255,.26);
    }
    .roof {
      position: absolute;
      left: 20%;
      right: 20%;
      top: 24%;
      height: 20%;
      border-radius: 22% 22% 8% 8%;
      background: rgba(255,255,255,.25);
      transform: perspective(440px) rotateX(58deg);
      transform-origin: bottom;
    }
    .initial {
      color: #fff;
      font-weight: 900;
      font-size: var(--font-size);
      line-height: 1;
      letter-spacing: 0;
      text-shadow: 0 ${Math.round(size * 0.016)}px ${Math.round(size * 0.034)}px rgba(0,0,0,.28);
      transform: translateY(-4%);
    }
    .copy { display: ${showCopy ? 'block' : 'none'}; margin-top: ${Math.round(size * 0.055)}px; text-align: center; color: #fff; }
    .title { font-size: ${titleSize}px; font-weight: 850; letter-spacing: 0; line-height: 1.04; }
    .subtitle { margin-top: ${Math.round(size * 0.018)}px; font-size: ${subtitleSize}px; font-weight: 650; color: rgba(255,255,255,.74); letter-spacing: 0; }
  </style>`;
}

function page(app, size, variant) {
  const isIcon = variant === 'icon' || variant === 'nativeLegacy';
  const compact = variant === 'favicon';
  const background = isIcon
    ? `background: linear-gradient(160deg, ${app.background} 0%, ${app.deep} 58%, #12363b 100%);`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8">${styles(app, size, variant)}<style>
    body { ${background} }
    .glow { display: ${isIcon ? 'block' : 'none'}; position: absolute; width: ${Math.round(size * 0.62)}px; height: ${Math.round(size * 0.62)}px; border-radius: 50%; background: ${app.accent}; opacity: .18; right: ${Math.round(size * -0.14)}px; top: ${Math.round(size * -0.18)}px; }
  </style></head><body><div class="glow"></div>${logoMarkup(app, size, compact, variant)}</body></html>`;
}

async function renderNativeAssets(app) {
  const resDir = path.resolve(__dirname, app.androidDir);
  for (const [folder, legacySize, foregroundSize] of launcherDensities) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    for (const name of ['ic_launcher.webp', 'ic_launcher_round.webp', 'ic_launcher_foreground.webp']) {
      fs.rmSync(path.join(dir, name), { force: true });
    }
    await render(page(app, legacySize, 'nativeLegacy'), path.join(dir, 'ic_launcher.png'), legacySize, legacySize);
    await render(page(app, legacySize, 'nativeLegacy'), path.join(dir, 'ic_launcher_round.png'), legacySize, legacySize);
    await render(page(app, foregroundSize, 'nativeForeground'), path.join(dir, 'ic_launcher_foreground.png'), foregroundSize, foregroundSize, true);
  }

  for (const [folder, size] of splashDensities) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    await render(page(app, size, 'nativeSplash'), path.join(dir, 'splashscreen_logo.png'), size, size, true);
  }
}

async function main() {
  for (const app of apps) {
    const outDir = path.resolve(__dirname, app.dir);
    fs.mkdirSync(outDir, { recursive: true });
    await render(page(app, 1024, 'icon'), path.join(outDir, 'icon.png'), 1024, 1024);
    await render(page(app, 1024, 'adaptive'), path.join(outDir, 'adaptive-icon.png'), 1024, 1024, true);
    await render(page(app, 1024, 'splash'), path.join(outDir, 'splash.png'), 1024, 1024, true);
    await render(page(app, 192, 'favicon'), path.join(outDir, 'favicon.png'), 192, 192, true);
    await renderNativeAssets(app);
  }
  console.log('Generated Naploo app assets.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});