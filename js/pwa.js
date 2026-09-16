let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function createInstallButton() {
  if (isStandalone() || document.getElementById('pwaInstallButton')) return;
  const button = document.createElement('button');
  button.id = 'pwaInstallButton';
  button.type = 'button';
  button.className = 'pwa-install';
  button.textContent = 'Instalar aplicación';
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
    alert('Para instalar: toca el botón Compartir de Safari y selecciona “Añadir a pantalla de inicio”.');
    return;
  }

  alert('Abre el menú del navegador y selecciona “Instalar aplicación” o “Agregar a pantalla principal”.');
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  createInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  document.getElementById('pwaInstallButton')?.remove();
});

document.addEventListener('DOMContentLoaded', () => {
  if (isIos() && !isStandalone()) createInstallButton();
});
