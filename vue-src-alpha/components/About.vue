<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatAboutPages"
      >
        <span class="material-symbols-outlined">info</span>
        <span class="text-2xl font-bold">About</span>
      </div>

      <div class="max-w-3xl mx-auto text-base text-gray-800 space-y-4">
        <!-- top alert removed; alpha notice moved into Overview content -->

        <!-- Use DaisyUI collapse components to make sections compact and consistent -->
        <div class="space-y-2">
          <div :class="['collapse border rounded', { 'collapse-open': open.overview }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('overview')" @keydown.enter.prevent="toggleSection('overview')" @keydown.space.prevent="toggleSection('overview')">Overview</div>
            <div class="collapse-content">
              <div class="mb-3">
                <div class="bg-yellow-50 border-l-4 border-yellow-300 px-3 py-2 text-sm text-yellow-800 rounded">
                  This is an alpha version of the Euphonium Tutor App — content and UI may change.
                </div>
              </div>
              <p class="leading-relaxed text-sm">
                The Euphonium Tutor App helps euphonium players improve technique,
                track progress, and explore practice material. It combines
                interactive tools, audio feedback, and modular extensions to
                support learners at different levels.
              </p>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.core }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('core')" @keydown.enter.prevent="toggleSection('core')" @keydown.space.prevent="toggleSection('core')">🎯 Core Features</div>
            <div class="collapse-content">
              <ul class="list-disc pl-5 space-y-1 text-sm">
                <li>Interactive fingering chart with visual feedback</li>
                <li>Real-time pitch analysis using Tone.js</li>
                <li>Practice streak and progress tracking</li>
                <li>Speech synthesis for spoken instructions</li>
                <li>Modular extension tracker and change-log</li>
              </ul>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.faq }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('faq')" @keydown.enter.prevent="toggleSection('faq')" @keydown.space.prevent="toggleSection('faq')">❓ FAQ — Creating an Exercise (from MuseScore)</div>
            <div class="collapse-content text-sm">
              <ol class="list-decimal pl-5 space-y-1">
                <li>Open your MuseScore arrangement.</li>
                <li>Choose File → Export.</li>
                <li>Select the parts you want to export.</li>
                <li>Set Export Settings: <strong>MusicXML | Uncompressed (*.musicxml)</strong>, <em>All Layout</em>.</li>
                <li>Click Export… then choose a location and click <strong>[Save]</strong> (example filename: <code>_E_TubaXmas_26_Hark_The_Herald_Angles_Sing.musicxml</code>).</li>
                <li>In the Music Tutor Studio site, navigate to <strong>Create Exercise</strong>.</li>
                <li>Open the <strong>MusicXML</strong> collapse.</li>
                <li>Click <strong>[CHOOSE FILE]</strong> and navigate to where the MusicXML file was saved.</li>
                <li>Select the MusicXML file.</li>
                <li>Click <strong>OPEN</strong> to upload. The parser will run and a preview appears in the Create Exercise workspace.</li>
              </ol>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.contributors }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('contributors')" @keydown.enter.prevent="toggleSection('contributors')" @keydown.space.prevent="toggleSection('contributors')">🧑‍💻 Contributors</div>
            <div class="collapse-content">
              <p class="text-sm">Content contributed by: Dan Garlen, Michael Fahrner, and AI assistants.</p>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.programmed }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('programmed')" @keydown.enter.prevent="toggleSection('programmed')" @keydown.space.prevent="toggleSection('programmed')">🧠 Programmed By</div>
            <div class="collapse-content">
              <p class="text-sm">Author: Dan Garlen and supporting AI/automation tools.</p>
            </div>
          </div>

          <!-- Prototype / Alpha links moved inside Feature Pipeline section below -->

          <div :class="['collapse border rounded', { 'collapse-open': open.docs }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('docs')" @keydown.enter.prevent="toggleSection('docs')" @keydown.space.prevent="toggleSection('docs')">📚 Documentation</div>
            <div class="collapse-content">
              <div class="space-y-2 text-sm">
                <p><a href="http://EuphoniumTutorDocs.garlen.net" target="_blank" class="link link-primary">Euphonium Tutor Docs</a></p>
                <p><a href="/prototype/cmtDocs.html" class="link">Compact Music Token (CMT) Format Documentation</a></p>
              </div>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.pipeline }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('pipeline')" @keydown.enter.prevent="toggleSection('pipeline')" @keydown.space.prevent="toggleSection('pipeline')">Feature Pipeline / Wish List</div>
            <div class="collapse-content">
              <ul id="feature-list" class="list-disc pl-5 text-sm text-gray-700">
                <li v-if="!features.length" class="text-sm text-gray-500">Loading features...</li>
                <li
                  v-for="f in features"
                  :key="f.title"
                  class="mb-2 p-2 rounded"
                  :class="{ 'bg-yellow-50 border border-yellow-300': f.status === 'Active' }">
                  <strong>{{ f.title }}</strong>: {{ f.description }}
                  <em class="ml-2 text-gray-600">[{{ f.status }}]</em>
                </li>
              </ul>
              <div class="mt-3">
                <a
                  class="btn btn-outline btn-sm mr-2"
                  href="https://musictutor.studio/prototype/"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop.prevent="openExternal('https://musictutor.studio/prototype/')"
                >[Version: Prototype]</a>
                <a
                  class="btn btn-primary btn-sm"
                  href="https://musictutor.studio/alpha/"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop.prevent="openExternal('https://musictutor.studio/alpha/')"
                >[Version: Alpha]</a>
              </div>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.changelog }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('changelog')" @keydown.enter.prevent="toggleSection('changelog')" @keydown.space.prevent="toggleSection('changelog')">Change Log</div>
            <div class="collapse-content text-sm text-gray-700">
              <ul id="change-list" class="list-disc pl-5">
                <li v-if="!changes.length" class="text-sm text-gray-500">Loading change log...</li>
                <li v-for="c in changes" :key="c.timestamp" class="mb-2">
                  <strong>{{ c.file }}</strong>: {{ c.change }} <em class="text-gray-500">[{{ formatDate(c.timestamp) }}]</em>
                </li>
              </ul>
            </div>
          </div>

          <div :class="['collapse border rounded', { 'collapse-open': open.ack }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="toggleSection('ack')" @keydown.enter.prevent="toggleSection('ack')" @keydown.space.prevent="toggleSection('ack')">Acknowledgements</div>
            <div class="collapse-content text-sm text-gray-700">
              <p>Thanks to open-source libraries and community contributors.</p>
              <ul id="ack-list" class="list-disc pl-5 mt-2">
                <li v-if="!tools.length" class="text-sm text-gray-500">Loading acknowledgements...</li>
                <li v-for="t in tools" :key="t.name" class="mb-2">
                  <span v-if="t.homepage">
                    <a :href="t.homepage" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">{{ t.name }}</a>
                  </span>
                  <span v-else><strong>{{ t.name }}</strong></span>
                  by <em>{{ t.publisher }}</em>: {{ t.description }}
                  <div v-if="t.links && t.links.length" class="mt-1">
                    <ul class="list-disc pl-5 text-sm">
                      <li v-for="(link, idx) in t.links" :key="idx"><a :href="link" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">{{ link }}</a></li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { ref, onMounted, reactive } from "vue";

const features = ref([]);
const changes = ref([]);
const tools = ref([]);

const open = reactive({
  overview: false,
  core: false,
  faq: false,
  contributors: false,
  programmed: false,
  docs: false,
  pipeline: false,
  changelog: false,
  ack: false
});

function toggleSection(key) {
  if (!Object.prototype.hasOwnProperty.call(open, key)) return;
  open[key] = !open[key];
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function buildDataUrl(filename) {
  // Use Vite's base if available so when the site is served from a subpath
  // (for example /alpha-vue-SPA/) the requests will target the correct folder.
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/';
  // Ensure base ends with '/'
  const normBase = base.endsWith('/') ? base : base + '/';
  return normBase + 'data/' + filename;
}

async function fetchJsonToRef(filename, refTarget, key) {
  try {
    const url = buildDataUrl(filename);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      refTarget.value = [];
      return;
    }
    const d = await res.json();
    if (key) {
      refTarget.value = Array.isArray(d[key]) ? d[key] : [];
    } else {
      // if top-level array
      refTarget.value = Array.isArray(d) ? d : [];
    }
  } catch (e) {
    console.error(`Failed loading ${filename}:`, e);
    refTarget.value = [];
  }
}

onMounted(async () => {
  await Promise.all([
    fetchJsonToRef('feature-pipeline.json', features, 'features'),
    fetchJsonToRef('change-log.json', changes, 'changes'),
    fetchJsonToRef('ack.json', tools, 'tools')
  ]);
});

function openExternal(url) {
  try {
    const newWin = window.open(url, '_blank');
    if (newWin) {
      // Try to disassociate opener for security
      try {
        newWin.opener = null;
      } catch (e) {
        /* ignore */
      }
    } else {
      // Fallback: navigate current window
      window.location.href = url;
    }
  } catch (e) {
    console.error('Failed to open external link', e);
    window.location.href = url;
  }
}
</script>
