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
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import FooterStandard from '../components/FooterStandard.vue'
import loadData from '../_network_interconnect/loadData.js'
import validateData from '../_network_interconnect/validateData.js'
import generateMarkdown from '../_network_interconnect/generateMarkdown.js'
import generateMermaid from '../_network_interconnect/generateMermaid.js'

const jsonText = ref('')
const errors = ref(null)
const markdown = ref('')
const mermaidCode = ref('')
const mermaidSvg = ref('')
const mermaidError = ref('')
const loading = ref(false)

async function reloadData() {
  loading.value = true
  errors.value = null
  markdown.value = ''
  mermaidCode.value = ''
  mermaidSvg.value = ''
  mermaidError.value = ''
  try {
    const data = await loadData()
    jsonText.value = JSON.stringify(data, null, 2)
  } catch (e) {
    jsonText.value = ''
    errors.value = ['Failed to load data: ' + (e.message || e)]
  }
  loading.value = false
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
  try {
    let mermaid;
    if (window.mermaid) {
      mermaid = window.mermaid;
    } else {
      mermaid = await import('mermaid');
      window.mermaid = mermaid.default || mermaid;
    }
    // Mermaid v11+ API: use renderAsync or parse+render, fallback to mermaidAPI.render for older versions
    let svg;
    if (typeof mermaid.render === 'function') {
      // Some versions: mermaid.renderAsync returns a Promise
      if (typeof mermaid.renderAsync === 'function') {
        svg = await mermaid.renderAsync('network-graph', mermaidCode.value);
      } else {
        // Try mermaid.render (may be sync or async)
        const result = await mermaid.render('network-graph', mermaidCode.value);
        svg = result.svg || result;
      }
    } else if (mermaid.mermaidAPI && typeof mermaid.mermaidAPI.render === 'function') {
      // Old API
      svg = await new Promise((resolve, reject) => {
        try {
          mermaid.mermaidAPI.render('network-graph', mermaidCode.value, resolve);
        } catch (err) {
          reject(err);
        }
      });
    } else {
      // No compatible render function found
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
  if (!markdown.value) return
  navigator.clipboard.writeText(markdown.value)
}

onMounted(reloadData)
</script>
