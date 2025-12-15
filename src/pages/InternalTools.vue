<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Header from '../components/Header.vue'
import FooterStandard from '../components/FooterStandard.vue'

// ---------- helpers ----------
function renderDebugTree(node, prefix = '', isLast = true) {
  if (!node) return '';
  const connector = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
  const labelText = node.label ? `[${node.label}] ` : '';
  let result = `${prefix}${connector}${labelText}${node.name}\n`;
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const last = i === children.length - 1;
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    result += renderDebugTree(children[i], childPrefix, last);
  }
  return result;
}

function buildTextTreeWithDebug(devices, connections) {
  const idToName = Object.fromEntries(devices.map(d => [d.id || d.name, d.name]));
  const labelMap = new Map();
  connections.forEach(c => {
    labelMap.set(`${c.from}|${c.to}`, {
      fromLabel: c.fromLabel,
      toLabel: c.toLabel,
      type: c.type
    });
  });

  const adj = {};
  devices.forEach(d => { adj[d.id || d.name] = []; });
  connections.forEach(c => {
    if (adj[c.from]) adj[c.from].push(c.to);
  });

  const allTargets = new Set(connections.map(c => c.to));
  const roots = devices.filter(d => !allTargets.has(d.id || d.name));
  if (!roots.length) {
    const treeString = devices.map(d => idToName[d.id || d.name]).join('\n');
    const debugTree = devices.map(d => ({ name: idToName[d.id || d.name], label: '', children: [] }));
    return { treeString, debugTree };
  }

  const lines = [];
  const debugTree = [];
  function dfs(node, prefix, isLast, incomingLabel) {
    const connector = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
    const labelText = incomingLabel ? `[${incomingLabel}] ` : '';
    lines.push(prefix + connector + labelText + idToName[node]);
    const children = adj[node] || [];
    const debugNode = { name: idToName[node], label: incomingLabel || '', children: [] };
    for (let i = 0; i < children.length; i++) {
      const last = i === children.length - 1;
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      const lbl = labelMap.get(`${node}|${children[i]}`);
      const edgeLabel = lbl ? [lbl.fromLabel, lbl.type, lbl.toLabel].filter(Boolean).join(' / ') : '';
      const childDebug = dfs(children[i], childPrefix, last, edgeLabel);
      debugNode.children.push(childDebug);
    }
    return debugNode;
  }
  for (let i = 0; i < roots.length; i++) {
    debugTree.push(dfs(roots[i].id || roots[i].name, '', i === roots.length - 1, ''));
  }
  return { treeString: lines.join('\n'), debugTree };
}

function validateData() {
  return [];
}

function generateMarkdown({ devices, connections }) {
  let md = '';
  if (devices && devices.length) {
    md += '## Devices\n\n';
    md += '| Name | Category | Location | Notes |\n';
    md += '|------|----------|----------|-------|\n';
    for (const d of devices) {
      md += `| ${d.name || ''} | ${d.category || ''} | ${d.location || ''} | ${d.notes || ''} |\n`;
    }
    md += '\n';
  }
  if (connections && connections.length) {
    md += '## Connections\n\n';
    for (const c of connections) {
      md += `- **${c.from}** → **${c.to}** (${c.type || ''})\n`;
    }
  }
  return md || 'No devices or connections.';
}

function generateMermaid({ devices, connections }) {
  const idToName = Object.fromEntries(devices.map(d => [d.id || d.name, d.name]));
  let mermaid = 'graph TD\n';
  for (const c of connections) {
    const from = idToName[c.from] || c.from;
    const to = idToName[c.to] || c.to;
    const labelParts = [];
    if (c.fromLabel) labelParts.push(c.fromLabel);
    if (c.type) labelParts.push(c.type);
    if (c.toLabel) labelParts.push(c.toLabel);
    const labelText = labelParts.join(' / ');
    const label = labelText ? `|${labelText}|` : '';
    mermaid += `  ${c.from}["${from}"] -->${label} ${c.to}["${to}"]\n`;
  }
  // Style power components with a contrasting color
  const powerIds = devices.filter(d => (d.category || '').toLowerCase() === 'power').map(d => d.id || d.name);
  if (powerIds.length) {
    mermaid += '  classDef power fill:#fde68a,stroke:#f59e0b,stroke-width:2px,rx:6,ry:6;\n';
    mermaid += `  class ${powerIds.join(',')} power;\n`;
  }
  return mermaid;
}

// ---------- state ----------
const jsonText = ref('');
const errors = ref(null);
const markdown = ref('');
const mermaidCode = ref('');
const mermaidSvg = ref('');
const mermaidError = ref('');
const textDiagram = ref({ treeString: '', debugTree: null });
const loading = ref(false);

// ---------- actions ----------
async function reloadData() {
  loading.value = true;
  try {
    const resp = await fetch('/data/network_topology.json');
    if (!resp.ok) throw new Error('Failed to load network_topology.json');
    const data = await resp.json();
    jsonText.value = JSON.stringify(data, null, 2);
  } catch (e) {
    jsonText.value = '{\n  "devices": [],\n  "connections": []\n}';
    errors.value = ['Could not load network_topology.json: ' + (e.message || e)];
  }
  markdown.value = '';
  mermaidCode.value = '';
  mermaidSvg.value = '';
  mermaidError.value = '';
  textDiagram.value = { treeString: '', debugTree: null };
  loading.value = false;
}

function handleValidate() {
  errors.value = null;
  let parsed;
  try {
    parsed = JSON.parse(jsonText.value);
  } catch (e) {
    errors.value = ['Invalid JSON: ' + (e.message || e)];
    return;
  }
  let devices = parsed.devices || [];
  let connections = parsed.connections || [];
  if (Array.isArray(parsed)) {
    devices = parsed;
    connections = [];
  }
  const err = validateData({ devices, connections });
  errors.value = err && err.length ? err : ['JSON is valid!'];
}

async function handleGenerate() {
  errors.value = null;
  markdown.value = '';
  mermaidCode.value = '';
  mermaidSvg.value = '';
  mermaidError.value = '';
  textDiagram.value = { treeString: '', debugTree: null };

  let parsed;
  try {
    parsed = JSON.parse(jsonText.value);
  } catch (e) {
    errors.value = ['Invalid JSON: ' + (e.message || e)];
    return;
  }
  let devices = parsed.devices || [];
  let connections = parsed.connections || [];
  if (Array.isArray(parsed)) {
    devices = parsed;
    connections = [];
  }
  const err = validateData({ devices, connections });
  if (err && err.length) {
    errors.value = err;
    return;
  }

  markdown.value = generateMarkdown({ devices, connections });
  mermaidCode.value = generateMermaid({ devices, connections });

  const { treeString, debugTree } = buildTextTreeWithDebug(devices, connections);
  let pretty = treeString;
  if (debugTree && debugTree.length) {
    pretty = debugTree.map(node => renderDebugTree(node)).join('\n');
  }
  textDiagram.value = { treeString: pretty, debugTree: null };

  await nextTick();
  try {
    let mermaid;
    if (window.mermaid) {
      mermaid = window.mermaid;
    } else {
      mermaid = await import('mermaid');
      window.mermaid = mermaid.default || mermaid;
    }
    let svg;
    if (typeof mermaid.render === 'function') {
      if (typeof mermaid.renderAsync === 'function') {
        svg = await mermaid.renderAsync('network-graph', mermaidCode.value);
      } else {
        const result = await mermaid.render('network-graph', mermaidCode.value);
        svg = result.svg || result;
      }
    } else if (mermaid.mermaidAPI && typeof mermaid.mermaidAPI.render === 'function') {
      svg = await new Promise((resolve, reject) => {
        try {
          mermaid.mermaidAPI.render('network-graph', mermaidCode.value, resolve);
        } catch (err) {
          reject(err);
        }
      });
    } else {
      const msg = 'No compatible Mermaid render function found. Please check that the Mermaid library is loaded and is a supported version.';
      console.error(msg, mermaid);
      throw new Error(msg);
    }
    mermaidSvg.value = svg;
  } catch (e) {
    mermaidError.value = 'Mermaid render error: ' + (e.message || e);
  }
}

function copyMarkdown() {
  if (!markdown.value) return;
  navigator.clipboard.writeText(markdown.value);
}

function copyTextDiagram() {
  const text = textDiagram.value?.treeString || '';
  if (!text) return;
  navigator.clipboard.writeText(text);
}

onMounted(reloadData)
</script>

<template>
  <div class="bg-base-200 min-h-screen flex flex-col">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2">Network Interconnect Tools</h2>
        <p class="text-gray-600 mb-4">Edit, validate, and visualize your network device and connection data.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="font-semibold">Raw JSON (devices & connections)</span>
            <button class="btn btn-xs btn-outline" @click="reloadData" :disabled="loading">Reload</button>
          </div>
          <textarea
            v-model="jsonText"
            class="textarea textarea-bordered w-full h-64 font-mono text-xs"
            spellcheck="false"
            :disabled="loading"
          ></textarea>
          <div class="mt-2 flex gap-2">
            <button class="btn btn-primary btn-sm" @click="handleValidate" :disabled="loading">Validate</button>
            <button class="btn btn-secondary btn-sm" @click="handleGenerate" :disabled="loading || (errors && errors.length && errors[0] !== 'JSON is valid!')">Generate</button>
          </div>
          <div v-if="errors" class="mt-2 text-xs whitespace-pre-line">
            <span class="font-bold">Validation Results:</span>
            <ul class="list-disc pl-5">
              <li v-for="(err, idx) in errors" :key="idx"
                  :class="err === 'JSON is valid!' ? 'text-success' : 'text-error'">
                {{ err }}
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="font-semibold">Markdown Output</span>
            <button class="btn btn-xs btn-outline" @click="copyMarkdown" :disabled="!markdown">Copy</button>
          </div>
          <div class="bg-base-100 border border-base-300 rounded p-2 h-64 overflow-auto font-mono text-xs whitespace-pre-wrap" style="min-height:16rem;">
            <span v-if="!markdown" class="text-gray-400">No Markdown generated yet.</span>
            <span v-else>{{ markdown }}</span>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <div class="mb-2 font-semibold">Mermaid Diagram Preview</div>
        <div class="bg-base-100 border border-base-300 rounded p-2 overflow-auto" style="min-height:12rem;">
          <div v-if="mermaidSvg" v-html="mermaidSvg"></div>
          <div v-else class="text-gray-400">No diagram generated yet.</div>
        </div>
        <div v-if="mermaidError" class="text-error text-xs mt-2">{{ mermaidError }}</div>
      </div>
      <div class="mt-8">
        <div class="mb-2 flex items-center justify-between">
          <span class="font-semibold">Network Text Diagram</span>
          <button class="btn btn-xs btn-outline" @click="copyTextDiagram" :disabled="!textDiagram.treeString">Copy</button>
        </div>
        <div class="bg-base-100 border border-base-300 rounded p-2 overflow-auto font-mono text-xs" style="min-height:8rem;">
          <pre v-if="textDiagram.treeString"
            style="font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', 'Liberation Mono', 'Courier New', monospace; font-size: 1.1em; letter-spacing: 0.03em; white-space: pre;"
          >{{ textDiagram.treeString }}</pre>
        </div>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
