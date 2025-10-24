<template>
  <div class="hello-two flex flex-col items-center gap-4 p-6">
    <h1 class="text-2xl font-bold mb-2">Hello from Vue Two</h1>
    <button class="btn btn-primary mb-2" @click="goBack">
      Back to Hello from Vue
    </button>
    <div class="flex flex-row gap-2 mb-4">
      <button class="btn btn-success" @click="saveState">Save State</button>
      <button class="btn btn-info" @click="recallState">Recall State</button>
      <input
        type="file"
        accept="application/json"
        @change="loadFromFile"
        ref="fileInput"
        class="file-input file-input-primary file-input-bordered"
        style="max-width: 220px"
      />
    </div>
    <div v-if="savedState" class="w-full max-w-xl">
      <div class="alert alert-info shadow-lg mb-2">
        <div>
          <span class="font-semibold">Saved State:</span>
        </div>
      </div>
      <pre class="bg-base-200 rounded p-2 overflow-x-auto">{{
        savedState
      }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useNameStore } from "../stores/name.js";

const router = useRouter();
const nameStore = useNameStore();
const savedState = ref("");
const fileInput = ref(null);

function goBack() {
  router.push("/");
}

function saveState() {
  const state = {
    name: nameStore.name,
    timestamp: new Date().toISOString(),
  };
  const json = JSON.stringify(state, null, 2);
  // Save to localStorage (optional, can remove if not needed)
  localStorage.setItem("vue-hello-world-test.json", json);
  savedState.value = json;
  // Trigger file download
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vue-hello-world-test.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function recallState() {
  const state = localStorage.getItem("vue-hello-world-test.json");
  if (state) {
    const parsed = JSON.parse(state);
    nameStore.setName(parsed.name);
    savedState.value = JSON.stringify(parsed, null, 2);
  } else {
    savedState.value = "No saved state found.";
  }
}

function triggerFileInput() {
  if (fileInput.value) fileInput.value.click();
}

function loadFromFile(event) {
  const file = event.target.files[0];
  if (!file) {
    savedState.value = "No file selected.";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    let text = e.target.result;
    try {
      const parsed = JSON.parse(text);
      if (parsed.name) nameStore.setName(parsed.name);
      savedState.value = JSON.stringify(parsed, null, 2);
    } catch (err) {
      savedState.value = text ? text : "Invalid JSON file.";
    }
  };
  reader.readAsText(file);
}
</script>

<style scoped>
.hello-two {
  text-align: center;
}
</style>
