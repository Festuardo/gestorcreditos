let deferredInstallPrompt = null;
const INSTALL_FLAG = 'gestorCreditosInstalado';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.navigator.standalone === true
    || document.referrer.startsWith('android-app://');
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIosSafari() {
  return isIos() && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios|opios/i.test(navigator.userAgent);
}

function markAsInstalled() {
  try { localStorage.setItem(INSTALL_FLAG, '1'); } catch (_) {}
}

function wasInstalled() {
  try { return localStorage.getItem(INSTALL_FLAG) === '1'; } catch (_) { return false; }
}

function removeInstallButton() {
  document.getElementById('pwaInstallButton')?.remove();
}

function createInstallButton() {
  if (isStandalone() || wasInstalled() || document.getElementById('pwaInstallButton')) return;
  const button = document.createElement('button');
  button.id = 'pwaInstallButton';
  button.type = 'button';
  button.className = 'pwa-install';
  button.textContent = isIos() ? 'Instalar en iPhone' : 'Instalar aplicación';
  button.setAttribute('aria-label', 'Instalar Gestor de Créditos');
  button.addEventListener('click', installApp);
  document.body.appendChild(button);
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.getElementById('pwaInstallButton')?.remove();
    return;
  }

  if (isIos()) {
    alert(isIosSafari()
      ? 'Para instalar: toca el botón Compartir de Safari y selecciona “Añadir a pantalla de inicio”.'
      : 'Para instalar en iPhone: abre esta página en Safari, toca Compartir y selecciona “Añadir a pantalla de inicio”.');
    return;
  }

  alert('Abre el menú del navegador y selecciona “Instalar aplicación” o “Agregar a pantalla principal”.');
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  if (isStandalone() || wasInstalled()) return;
  deferredInstallPrompt = event;
  createInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  markAsInstalled();
  removeInstallButton();
});

document.addEventListener('DOMContentLoaded', () => {
  if (isStandalone()) {
    markAsInstalled();
    removeInstallButton();
    return;
  }
  if (isIos() && !wasInstalled()) createInstallButton();
});

window.addEventListener('pageshow', () => {
  if (isStandalone()) {
    markAsInstalled();
    removeInstallButton();
  }
});
