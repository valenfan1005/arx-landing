/**
 * flow-bg.js
 * Streams a Mux HLS clip into any .flow-bg-video element on the page.
 * - Safari: native HLS via <video src>
 * - Chrome/Firefox/Edge: hls.js (loaded via CDN in index.html)
 *
 * Source: Mux public stream. CORS is wide open (access-control-allow-origin: *).
 * If the URL ever 403/404s, swap HLS_URL or fall back to a self-hosted MP4.
 */
(function () {
  'use strict';

  var HLS_URL = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

  function play(video) {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* autoplay blocked */ });
  }

  function init(video) {
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari / iOS — native HLS
      video.src = HLS_URL;
      video.addEventListener('loadedmetadata', function () { play(video); }, { once: true });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      // capLevelToPlayerSize:false + startLevel:-1 forces hls.js to use the
      // highest bandwidth-allowed rendition (720p) instead of downscaling to
      // 480x270 just because the <video> element is short. Prevents blur.
      var hls = new window.Hls({
        lowLatencyMode: false,
        capLevelToPlayerSize: false,
        startLevel: -1,
        autoStartLoad: true
      });
      hls.loadSource(HLS_URL);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        // Force pick the highest available level on init
        hls.currentLevel = hls.levels.length - 1;
        play(video);
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          video.style.display = 'none';
          if (window.console) console.warn('[flow-bg] HLS fatal error', data);
        }
      });
    } else {
      video.style.display = 'none';
    }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var videos = document.querySelectorAll('.flow-bg-video');
    Array.prototype.forEach.call(videos, init);
  });
})();
