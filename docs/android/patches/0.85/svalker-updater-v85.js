/* СВАЛКЕР Alfa 0.85: канал Android-обновлений.
   APK скачивается только по желанию пользователя; установка требует подтверждения Android.
   Сохранения не изменяются. */
(function () {
  'use strict';

  var INSTALLED_BUILD = 85;
  var FEED = 'https://mikiawelloo.github.io/svalker-updates/android/latest.js';
  var TIMEOUT_MS = 14000;
  var pending = false;
  var received = false;
  var timer = null;
  var state = 'Проверка ещё не завершена';
  var statusNode = null;
  var lastAnnouncedVersion = null;

  function setStatus(message) {
    state = message;
    if (statusNode) statusNode.textContent = message;
    console.info('[СВАЛКЕР · обновления] ' + message);
  }

  function validReleaseUrl(value) {
    try {
      var u = new URL(value);
      if (u.protocol === 'https:' && u.hostname === 'github.com' &&
          /^\/mikiawelloo\/svalker-updates\/releases\/(tag\/[^/]+|latest)$/.test(u.pathname)) return u.href;
    } catch (_) {}
    return null;
  }

  function validApkUrl(value) {
    try {
      var u = new URL(value);
      if (u.protocol === 'https:' && u.hostname === 'github.com' &&
          /^\/mikiawelloo\/svalker-updates\/releases\/download\/[^/]+\/[^/]+\.apk$/i.test(u.pathname)) return u.href;
    } catch (_) {}
    return null;
  }

  function displaySize(bytes) {
    if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return null;
    return (bytes / 1048576).toFixed(1) + ' МБ';
  }

  function actionLink(label, url, primary) {
    var el = document.createElement('a');
    el.href = url;
    el.textContent = label;
    el.rel = 'noopener noreferrer';
    el.style.cssText = primary
      ? 'display:inline-block;padding:11px 14px;color:#112116;background:#b5d58e;border-radius:8px;font-weight:700;text-decoration:none;margin:3px 7px 6px 0'
      : 'display:inline-block;padding:10px;color:#e5eddf;border:1px solid #596d5e;border-radius:8px;text-decoration:none;margin:3px 7px 6px 0';
    return el;
  }

  function announce(data) {
    if (!data || !Number.isSafeInteger(data.versionCode) ||
        typeof data.version !== 'string' || !/^\d+(?:\.\d+){1,2}$/.test(data.version)) {
      setStatus('Ошибка: сервер передал неверный номер версии.');
      return;
    }
    var page = validReleaseUrl(data.releasePageUrl);
    if (!page) {
      setStatus('Ошибка: сервер передал неверный адрес выпуска.');
      return;
    }
    received = true;
    if (data.versionCode <= INSTALLED_BUILD) {
      setStatus('Сервер доступен. Установлена актуальная версия Alfa 0.85.');
      return;
    }

    setStatus('Найдена Alfa ' + data.version + '. Обновление доступно для скачивания.');
    if (document.getElementById('svalker-android-update-notice85') || lastAnnouncedVersion === data.versionCode) return;
    lastAnnouncedVersion = data.versionCode;
    var apk = validApkUrl(data.apkUrl);
    var size = displaySize(data.apkSizeBytes || data.sizeBytes);
    var box = document.createElement('div');
    box.id = 'svalker-android-update-notice85';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Обновление СВАЛКЕРА');
    box.style.cssText = 'position:fixed;z-index:2147483647;left:12px;right:12px;bottom:max(14px,env(safe-area-inset-bottom));max-width:480px;margin:auto;padding:16px;background:#14201a;color:#ecf0e8;border:1px solid #80947c;border-radius:12px;box-shadow:0 5px 32px #000c;font:14px/1.5 Arial,sans-serif;max-height:72vh;overflow:auto';

    var title = document.createElement('strong');
    title.textContent = 'СВАЛКЕР · доступна Alfa ' + data.version;
    title.style.cssText = 'display:block;font-size:18px;margin-bottom:7px';
    box.appendChild(title);

    var detail = document.createElement('div');
    detail.textContent = 'Ваша версия: Alfa 0.85' + (size ? ' · Размер APK: ' + size : '');
    detail.style.cssText = 'font-size:12px;color:#b7c9b8;margin-bottom:8px';
    box.appendChild(detail);

    var notes = Array.isArray(data.notes) ? data.notes.filter(function (s) { return typeof s === 'string'; }).slice(0, 6) : [];
    if (notes.length) {
      var ul = document.createElement('ul');
      ul.style.cssText = 'margin:3px 0 13px;padding-left:22px';
      notes.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }

    if (apk) box.appendChild(actionLink('Скачать APK', apk, true));
    box.appendChild(actionLink(apk ? 'Страница выпуска' : 'Открыть обновление', page, !apk));

    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Позже';
    close.style.cssText = 'padding:10px 12px;background:#314238;color:#edf4e6;border:0;border-radius:8px;cursor:pointer';
    close.addEventListener('click', function () {
      box.remove();
      lastAnnouncedVersion = null;
    });
    box.appendChild(close);

    var hint = document.createElement('div');
    hint.textContent = 'Установка новой версии потребует подтверждения Android. Сохранения игры не удаляйте.';
    hint.style.cssText = 'color:#b7c9b8;font-size:11px;margin-top:8px';
    box.appendChild(hint);
    (document.body || document.documentElement).appendChild(box);
  }

  function checkForUpdate() {
    if (pending) return;
    pending = true;
    received = false;
    setStatus('Соединяемся с сервером обновлений…');
    var script = document.createElement('script');
    script.async = true;
    script.src = FEED + '?v=' + Date.now();
    function finish() {
      pending = false;
      if (timer !== null) { clearTimeout(timer); timer = null; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    script.onerror = function () {
      setStatus('Не удалось проверить обновления. Проверьте интернет.');
      finish();
    };
    script.onload = function () {
      if (!received) setStatus('Сервер ответил, но данные о версии не получены.');
      finish();
    };
    timer = setTimeout(function () {
      setStatus('Сервер не ответил за 14 секунд. Повторите проверку позже.');
      finish();
    }, TIMEOUT_MS);
    (document.head || document.documentElement).appendChild(script);
  }

  function addSettingsControls() {
    var panel = document.getElementById('frontSettingsPanel81');
    if (!panel || document.getElementById('svalker-check-update85')) return;
    var section = document.createElement('section');
    section.style.cssText = 'margin:18px 0 8px;padding:12px;border:1px solid #637764;border-radius:10px;background:#142017;color:#e2ebdb';
    var title = document.createElement('strong');
    title.textContent = 'ОБНОВЛЕНИЯ · Alfa 0.85';
    title.style.cssText = 'display:block;margin-bottom:8px';
    section.appendChild(title);
    var button = document.createElement('button');
    button.id = 'svalker-check-update85';
    button.type = 'button';
    button.textContent = 'Проверить обновления';
    button.style.cssText = 'padding:10px 14px;background:#b6d58e;border:0;border-radius:7px;color:#142117;font-weight:bold';
    button.addEventListener('click', checkForUpdate);
    section.appendChild(button);
    statusNode = document.createElement('p');
    statusNode.id = 'svalker-update-status85';
    statusNode.setAttribute('role', 'status');
    statusNode.textContent = state;
    statusNode.style.cssText = 'font-size:12px;line-height:1.4;margin:9px 0 0;color:#b9cbb9';
    section.appendChild(statusNode);
    panel.appendChild(section);
  }

  window.SvalkerAndroidUpdates = {
    receive: announce,
    check: checkForUpdate,
    installedVersionCode: INSTALLED_BUILD
  };
  function init() { addSettingsControls(); checkForUpdate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();