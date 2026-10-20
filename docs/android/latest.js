/* СВАЛКЕР Android: публичный канал версий.
 * Меняйте эту запись ТОЛЬКО после загрузки и проверки APK в GitHub Releases.
 * Передача выполняется через script tag для совместимости с WebView file://.
 */
if (window.SvalkerAndroidUpdates && typeof window.SvalkerAndroidUpdates.receive === 'function') {
  window.SvalkerAndroidUpdates.receive({
    version: '0.83',
    versionCode: 83,
    releasePageUrl: 'https://github.com/mikiawelloo/svalker-updates/releases/latest',
    notes: [
      'Добавлена проверка новых версий при запуске.',
      'Игровые сохранения и локальные ресурсы сохраняются.'
    ]
  });
}
