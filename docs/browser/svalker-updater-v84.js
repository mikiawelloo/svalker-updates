/* СВАЛКЕР 0.84 — безопасная проверка обновлений.
   Не меняет сохранения и не устанавливает APK без участия Android. */
(function () {
  'use strict';
  var INSTALLED_BUILD = 84;
  var RELEASES = 'https://github.com/mikiawelloo/svalker-updates/releases';
  var FEED = 'https://mikiawelloo.github.io/svalker-updates/android/latest.js';
  var lastAnnouncement = null;

  function isAllowedReleaseUrl(input) {
    try {
      var url = new URL(input);
      return url.protocol === 'https:' && url.hostname === 'github.com' &&
        url.pathname.indexOf('/mikiawelloo/svalker-updates/releases/') === 0;
    } catch (_) { return false; }
  }

  function announce(update) {
    if (!update || !Number.isSafeInteger(update.versionCode) ||
        update.versionCode <= INSTALLED_BUILD || lastAnnouncement === update.versionCode) return;
    if (!isAllowedReleaseUrl(update.releasePageUrl)) return;
    lastAnnouncement = update.versionCode;
    var container = document.createElement('div');
    container.id = 'svalker-android-update-notice';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'Обновление СВАЛКЕРА');
    container.style.cssText = 'position:fixed;inset:auto 12px 14px 12px;max-width:460px;margin:auto;padding:18px;background:#15221d;color:#e5eddf;border:1px solid #769276;border-radius:12px;z-index:2147483647;box-shadow:0 5px 30px #000b;font:14px/1.55 Arial,sans-serif';

    var title = document.createElement('strong');
    title.textContent = 'СВАЛКЕР — обновление ' + String(update.version || update.versionCode);
    title.style.cssText = 'display:block;font-size:18px;margin-bottom:8px';
    container.appendChild(title);
    var description = document.createElement('p');
    description.textContent = Array.isArray(update.notes) ? update.notes.filter(function (s) { return typeof s === 'string'; }).slice(0, 6).join(' • ') : 'Доступна новая версия.';
    description.style.cssText = 'margin:0 0 12px';
    container.appendChild(description);
    var link = document.createElement('a');
    link.href = update.releasePageUrl;
    link.textContent = 'Открыть страницу обновления';
    link.style.cssText = 'display:inline-block;padding:10px 12px;color:#10201a;background:#bad899;font-weight:bold;border-radius:8px;text-decoration:none;margin:0 8px 6px 0';
    container.appendChild(link);
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Позже';
    close.style.cssText = 'padding:10px 12px;color:#e5eddf;background:#37483d;border:0;border-radius:8px';
    close.addEventListener('click', function () { container.remove(); });
    container.appendChild(close);
    (document.body || document.documentElement).appendChild(container);
  }

  window.SvalkerAndroidUpdates = { receive: announce, check: checkForUpdate, installedVersionCode: INSTALLED_BUILD };
  function checkForUpdate() {
    if (document.querySelector('script[data-svalker-update-check]')) return;
    var script = document.createElement('script');
    script.dataset.svalkerUpdateCheck = 'true';
    script.async = true;
    script.src = FEED + '?t=' + Date.now();
    script.onerror = function () { script.remove(); /* Игра работает офлайн. */ };
    script.onload = function () { script.remove(); };
    (document.head || document.documentElement).appendChild(script);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkForUpdate, {once:true});
  else checkForUpdate();
})();
