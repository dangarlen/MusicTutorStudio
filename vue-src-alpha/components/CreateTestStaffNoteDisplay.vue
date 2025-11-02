<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div class="card bg-base-100 shadow-xl p-6 mt-4">
        <h2 class="card-title text-lg font-semibold mb-2">
          VexFlow Staff (Pinia Note Data)
        </h2>
        <div
          ref="vfContainer"
          class="mtsFormatVexFlowContainer border border-gray-300 rounded p-4 min-h-[200px]"
        ></div>
        <button class="btn btn-sm btn-info mt-4" @click="loadNoteData">
          Refresh Data
        </button>
        <button
          class="mtsFormatCreatorButtons mt-6"
          @click="$router.push({ name: 'creator' })"
        >
          <span class="material-symbols-outlined">edit_square</span>
          Return to Creator
        </button>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { ref, onMounted, watch } from "vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";

const vfContainer = ref(null);
const store = useTestStaffNoteStore();
let staffFormat = null;

async function fetchStaffFormat() {
  if (staffFormat) return staffFormat;
  try {
    const resp = await fetch(import.meta.env.BASE_URL + "staff-format.json");
    staffFormat = await resp.json();
    return staffFormat;
  } catch (e) {
    console.error("[VexFlow] Could not load staff-format.json", e);
    staffFormat = {
      staff: {
        x: 10,
        y: 40,
        width: 380,
        height: 120,
        clef: "treble",
        ledgerLines: { above: 3, below: 3 },
      },
      noteColors: ["black", "blue", "orange", "green"],
    };
    return staffFormat;
  }
}

async function renderVexFlow(notes) {
  console.log("[VexFlow] renderVexFlow called with notes:", notes);
  // Debug: log each note object
  if (Array.isArray(notes)) {
    notes.forEach((n, i) => {
      console.log(`[VexFlow] Note ${i}:`, n);
    });
  } else {
    console.warn("[VexFlow] notes is not an array:", notes);
  }
  if (!vfContainer.value) {
    console.warn("[VexFlow] vfContainer is not defined");
    return;
  }
  vfContainer.value.innerHTML = "";

  const VF = globalThis.Vex ? globalThis.Vex.Flow : null;
  if (!VF) {
    console.error("[VexFlow] VexFlow is not loaded on globalThis");
    return;
  }

  const format = await fetchStaffFormat();
  const s = format.staff;

  // Center staff in container
  vfContainer.value.style.display = "flex";
  vfContainer.value.style.justifyContent = "center";
  vfContainer.value.style.height = s.height + "px";
  if (s.verticalCenter) {
    vfContainer.value.style.alignItems = "center";
  } else {
    vfContainer.value.style.alignItems = "flex-start";
  }

  try {
    const renderer = new VF.Renderer(
      vfContainer.value,
      VF.Renderer.Backends.SVG
    );
    renderer.resize(s.width, s.height);
    const context = renderer.getContext();
    // Position staff to allow ledger lines above/below
    const y = s.y;
    const x = s.x;
    const stave = new VF.Stave(x, y, s.width);
    stave.addClef(s.clef || "treble");
    stave.setContext(context).draw();

    // Ledger lines: VexFlow draws ledger lines automatically for notes out of staff range
    // To show 3 above/below, ensure your notes include those pitches

    const vfNotes = [];
    // Defensive: check for valid array and valid fields
    if (!Array.isArray(notes)) {
      console.warn("[VexFlow] notes is not an array:", notes);
    }
    for (const n of Array.isArray(notes)
      ? notes.filter(
          (n) => n.noteVisible !== false && n.noteVisible !== "false"
        )
      : []) {
      if (!n.pitch || !n.duration) {
        console.warn("[VexFlow] Skipping note with missing pitch/duration:", n);
        continue;
      }
      // VexFlow expects keys like 'C/4', 'C#/4', 'Db/5'
      let key = n.pitch.replace(/([A-G][b#]?)(\d)/, "$1/$2");
      // Validate key and duration
      if (!/^([A-G][b#]?\/\d)$/.test(key)) {
        console.warn(`[VexFlow] Skipping invalid pitch at idx:`, n.pitch);
        continue;
      }
      if (!["q", "h", "w", "e"].includes(n.duration)) {
        console.warn(`[VexFlow] Skipping invalid duration at idx:`, n.duration);
        continue;
      }
      const note = new VF.StaveNote({ keys: [key], duration: n.duration });
      if (n.noteColor) {
        note.setStyle({ fillStyle: n.noteColor, strokeStyle: n.noteColor });
      }
      if (n.overlay) {
        note.addAnnotation(
          0,
          new VF.Annotation(n.overlay).setVerticalJustification(
            VF.Annotation.VerticalJustify.TOP
          )
        );
      }
      vfNotes.push(note);
    }
    console.log("[VexFlow] vfNotes:", vfNotes);

    if (vfNotes.length > 0) {
      VF.Formatter.FormatAndDraw(context, stave, vfNotes);
      console.log("[VexFlow] Staff rendered successfully");
    } else {
      console.warn("[VexFlow] No notes to render; staff drawn without notes.");
    }
  } catch (err) {
    console.error("[VexFlow] Error rendering staff:", err);
  }
}

onMounted(() => {
  renderVexFlow(store.noteArray);
});

watch(
  () => store.noteArray,
  (newNotes) => {
    renderVexFlow(newNotes);
  }
);

function loadNoteData() {
  renderVexFlow(store.noteArray);
}
</script>
