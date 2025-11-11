(function(){
  // Alternate loader path for non-subfolder serving. Prefers ./libs/vexflow-debug.js near this file.
  const localPath = './libs/vexflow-debug.js';
  const cdnPath = 'https://cdn.jsdelivr.net/npm/vexflow@3.0.9/releases/vexflow-debug.js';
  function insertScript(src) {
    try {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      document.head.appendChild(s);
      console.debug('[vexflow-loader] loading', src);
    } catch (e) {
      console.warn('[vexflow-loader] failed to insert script', src, e);
    }
  }
  fetch(localPath, { method: 'GET' }).then(resp => {
    if (resp.ok) insertScript(localPath);
    else insertScript(cdnPath);
  }).catch(() => insertScript(cdnPath));
})();
