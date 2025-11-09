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
          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">Overview</div>
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

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">🎯 Core Features</div>
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

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">🧑‍💻 Contributors</div>
            <div class="collapse-content">
              <p class="text-sm">Content contributed by: Dan Garlen, Michael Fahrner, and AI assistants.</p>
            </div>
          </div>

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">🧠 Programmed By</div>
            <div class="collapse-content">
              <p class="text-sm">Author: Dan Garlen and supporting AI/automation tools.</p>
            </div>
          </div>

          <!-- Prototype / Alpha links moved inside Feature Pipeline section below -->

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">📚 Documentation</div>
            <div class="collapse-content">
              <div class="space-y-2 text-sm">
                <p><a href="http://EuphoniumTutorDocs.garlen.net" target="_blank" class="link link-primary">Euphonium Tutor Docs</a></p>
                <p><a href="/prototype/cmtDocs.html" class="link">Compact Music Token (CMT) Format Documentation</a></p>
              </div>
            </div>
          </div>

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">Feature Pipeline / Wish List</div>
            <div class="collapse-content">
              <ul class="list-disc pl-5 text-sm text-gray-700">
                <li>Drag-and-drop lesson editor</li>
                <li>Improved audio analysis visualizations</li>
                <li>More instrument fingerings and transpositions</li>
              </ul>
              <div class="mt-3">
                <a class="btn btn-outline btn-sm mr-2" href="/prototype/about.html" target="_blank" rel="noreferrer">Prototype Version</a>
                <a class="btn btn-primary btn-sm" href="https://musictutor.studio/" target="_blank" rel="noreferrer">Alpha (musictutor.studio)</a>
              </div>
            </div>
          </div>

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">Change Log</div>
            <div class="collapse-content text-sm text-gray-700">
              <ul class="list-disc pl-5">
                <li>2025-09-21 — Alpha release: initial SPA & feature set</li>
              </ul>
            </div>
          </div>

          <div tabindex="0" class="collapse border rounded">
            <div class="collapse-title text-lg font-semibold">Acknowledgements</div>
            <div class="collapse-content text-sm text-gray-700">
              <p>Thanks to open-source libraries and community contributors.</p>
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
</script>
