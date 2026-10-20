/* СВАЛКЕР: проверка новой версии для браузерной части игры.
   Не скачивает и не устанавливает APK автоматически. */
(function (global) {
  'use strict';

  function parseVersion(value) {
    if (typeof value !== 'string' || !/^\d+\.\d+\.\d+$/.test(value)) return null;
    return value.split('.').map(Number);
  }

  function isNewer(latest, current) {
    const a = parseVersion(latest), b = parseVersion(current);
    if (!a || !b) return false;
    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) return true;
      if (a[i] < b[i]) return false;
    }
    return false;
  }

  function createButton(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'background:#b3d77b;color:#101c16;padding:10px 16px;border:0;border-radius:7px;cursor:pointer;font-weight:700';
    button.addEventListener('click', onClick);
    return button;
  }

  function showBanner(root, info, current) {
    const prior = root.querySelector('[data-svalker-update-banner]');
    if (prior) prior.remove();
    const banner = document.createElement('aside');
    banner.dataset.svalkerUpdateBanner = 'true';
    banner.setAttribute('role', 'status');
    banner.style.cssText = 'position:fixed;z-index:2147483647;inset:auto 12px 12px 12px;max-width:500px;margin:auto;background:#19231e;color:white;border:1px solid #667f68;border-radius:12px;padding:16px;font:14px/1.5 system-ui,sans-serif;box-shadow:0 4px 22px #0008';
    const title = document.createElement('strong');
    title.textContent = 'СВАЛКЕР: доступна версия ' + info.version;
    title.style.cssText = 'display:block;font-size:17px;margin-bottom:6px';
    banner.appendChild(title);

    const details = document.createElement('div');
    const notes = Array.isArray(info.notes) ? info.notes.filter(x => typeof x === 'string').join(' · ') : '';
    details.textContent = 'Установлена ' + current + '. ' + notes;
    details.style.marginBottom = '12px';
    banner.appendChild(details);

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    const candidate = info.apkUrl || info.releasePageUrl;
    let url = null;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'https:') url = parsed.href;
    } catch (_) { /* Ссылка пока не добавлена. */ }

    if (url) actions.appendChild(createButton('Открыть обновление', () => global.open(url, '_blank', 'noopener,noreferrer')));
    else {
      const notice = document.createElement('span');
      notice.textContent = 'APK пока не опубликован.';
      actions.appendChild(notice);
    }

    actions.appendChild(createButton('Закрыть', () => banner.remove()));
    banner.appendChild(actions);
    root.appendChild(banner);
    return banner;
  }

  async function checkForUpdates({manifestUrl, currentVersion, root = document.body, showUpToDate = false}) {
    if (!manifestUrl || !parseVersion(currentVersion)) throw new Error('Требуется URL и версия формата X.Y.Z');
    const res = await fetch(manifestUrl, {cache: 'no-store'});
    if (!res.ok) throw new Error('Не удалось загрузить version.json: HTTP ' + res.status);
    const info = await res.json();
    if (!info || !parseVersion(info.version)) throw new Error('Некорректная версия в version.json');
    if (isNewer(info.version, currentVersion)) {
      return {updateAvailable: true, manifest: info, banner: showBanner(root, info, currentVersion)};
    }
    if (showUpToDate) global.alert('Установлена актуальная версия: ' + currentVersion);
    return {updateAvailable: false, manifest: info};
  }

  async function init(options) {
    try { return await checkForUpdates(options); }
    catch (error) {
      console.warn('[СВАЛКЕР] Проверка обновлений недоступна:', error);
      return {updateAvailable: false, error: String(error)};
    }
  }

  global.SvalkerUpdater = {init, checkForUpdates, isNewer};
})(window);
