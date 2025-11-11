(function(){
  // Loader that prefers a local copy of VexFlow at ./libs/vexflow-debug.js
  // and falls back to the CDN if the local file is not present.
  const localPath = './libs/vexflow-debug.js';
  const cdnPath = 'https://cdn.jsdelivr.net/npm/vexflow@3.0.9/releases/vexflow-debug.js';
  function insertScript(src) {
    try {
      const s = document.createElement('script');
      s.src = src;
      s.async = false; // preserve execution order
      document.head.appendChild(s);
      console.debug('[vexflow-loader] loading', src);
    } catch (e) {
      console.warn('[vexflow-loader] failed to insert script', src, e);
    }
  }
  // Try fetching the local file to detect presence (HEAD may be denied on some servers, so try GET with range)
  fetch(localPath, { method: 'GET' }).then(resp => {
    if (resp.ok) insertScript(localPath);
    else insertScript(cdnPath);
  }).catch(() => {
    // Network/local fetch failed — fall back to CDN
    insertScript(cdnPath);
  });
})();
