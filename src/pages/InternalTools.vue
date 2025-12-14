function handleValidate() {
  errors.value = null;
  let parsed;
  try {
    parsed = JSON.parse(jsonText.value);
  } catch (e) {
    errors.value = ['Invalid JSON: ' + (e.message || e)];
    return;
  }
  // Accept both {devices, connections} and {devices:[], connections:[]} or {devices:[]} only
  let devices = parsed.devices || [];
  let connections = parsed.connections || [];
  // If parsed is an array, treat as devices only
  if (Array.isArray(parsed)) {
    devices = parsed;
    connections = [];
  }
  const err = validateData({ devices, connections });
  if (err && err.length) {
    errors.value = err;
  } else {
    errors.value = ['JSON is valid!'];
  }
}

async function handleGenerate() {
  errors.value = null;
  markdown.value = '';
  mermaidCode.value = '';
  mermaidSvg.value = '';
  mermaidError.value = '';
  textDiagram.value = '';
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
  textDiagram.value = buildTextTree(devices, connections);
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
        <div class="mb-2 font-semibold">Network Text Diagram</div>
        <div class="bg-base-100 border border-base-300 rounded p-2 overflow-auto font-mono text-xs" style="min-height:8rem;">
          <pre v-if="textDiagram" style="font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', 'Liberation Mono', 'Courier New', monospace; font-size: 1.2em; letter-spacing: 0.05em; white-space: pre;">{{ textDiagram }}</pre>
        </div>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>



<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Header from '../components/Header.vue'
import FooterStandard from '../components/FooterStandard.vue'
const jsonText = ref('');
const errors = ref(null);
const markdown = ref('');
const mermaidCode = ref('');
const mermaidSvg = ref('');
const mermaidError = ref('');
const textDiagram = ref('');
const loading = ref(false);


async function reloadData() {
  // Load the real network_topology.json from public/data
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
  textDiagram.value = '';
}

function validateData() {
  // Stub: always return [] (no errors)
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
  if (!md) {
    md = 'No devices or connections.';
  }
  return md;
}
function generateMermaid({ devices, connections }) {
  // Build a Mermaid diagram using device names as labels
  const idToName = Object.fromEntries(devices.map(d => [d.id || d.name, d.name]));
  let mermaid = 'graph TD\n';
  for (const c of connections) {
    const from = idToName[c.from] || c.from;
    const to = idToName[c.to] || c.to;
    const label = c.type ? `|${c.type}|` : '';
    mermaid += `  ${c.from}["${from}"] -->${label} ${c.to}["${to}"]\n`;
  }
  return mermaid;
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
  // Accept both {devices, connections} and {devices:[], connections:[]} or {devices:[]} only
  let devices = parsed.devices || [];
  let connections = parsed.connections || [];
  // If parsed is an array, treat as devices only
  if (Array.isArray(parsed)) {
    devices = parsed;
    connections = [];
  }
  const err = validateData({ devices, connections });
  if (err && err.length) {
    errors.value = err;
  } else {
    errors.value = ['JSON is valid!'];
  }
}

async function handleGenerate() {
  errors.value = null;
  markdown.value = '';
  mermaidCode.value = '';
  mermaidSvg.value = '';
  mermaidError.value = '';
  textDiagram.value = '';
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
  textDiagram.value = buildTextTree(devices, connections);
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

function buildTextTree(devices, connections) {
  // Map deviceId to device name
  const idToName = Object.fromEntries(devices.map(d => [d.id || d.name, d.name]));
  // Build child map: for each device, who does it connect to (outgoing)?
  const outAdj = {};
  devices.forEach(d => { outAdj[d.id || d.name] = []; });
  connections.forEach(c => {
    if (outAdj[c.from]) outAdj[c.from].push(c.to);
  });
  // Build parent map: for each device, who connects to it (incoming)?
  const inAdj = {};
  devices.forEach(d => { inAdj[d.id || d.name] = []; });
  connections.forEach(c => {
    if (inAdj[c.to]) inAdj[c.to].push(c.from);
  });
  // Find roots (devices not targeted by any connection)
  const allTargets = new Set(connections.map(c => c.to));
  const roots = devices.filter(d => !allTargets.has(d.id || d.name));
  if (!roots.length) {
    return devices.map(d => idToName[d.id || d.name]).join('\n');
  }
  // To avoid cycles and duplicate children, track visited
  const lines = [];
  const visited = new Set();
  function dfs(node, prefix, isLast) {
    const connector = prefix ? (isLast ? '└── ' : '├── ') : '';
    lines.push(prefix + connector + idToName[node]);
    // Children: devices this node connects to (outgoing)
    let children = outAdj[node] || [];
    // For switches/routers, also show devices that connect to them (incoming), but not if already shown
    if (children.length === 0 && inAdj[node].length > 0) {
      children = inAdj[node];
    }
    // Remove already visited to avoid cycles
    children = children.filter(child => !visited.has(child));
    visited.add(node);
    for (let i = 0; i < children.length; i++) {
      const last = i === children.length - 1;
      const childPrefix = prefix + (prefix ? (isLast ? '    ' : '│   ') : '');
      dfs(children[i], childPrefix, last, visited);
    }
    visited.delete(node);
  }
  for (let i = 0; i < roots.length; i++) {
    dfs(roots[i].id || roots[i].name, '', i === roots.length - 1, new Set());
  }
  return lines.join('\n');
}

function copyMarkdown() {
  if (!markdown.value) return
  navigator.clipboard.writeText(markdown.value)
}

onMounted(reloadData)
</script>
