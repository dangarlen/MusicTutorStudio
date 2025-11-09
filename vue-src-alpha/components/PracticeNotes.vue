<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div class="flex items-center gap-2 mb-4 px-4 py-2 rounded mtsFormatPracticePages">
        <span class="material-symbols-outlined">note_alt</span>
        <span class="text-2xl font-bold">Practice Notes</span>
      </div>

      <div class="max-w-3xl mx-auto">
        <!-- Signed in status (same style as lessons-create) -->
        <AuthStatusBanner />

        <div class="mt-6">
          <p class="text-sm text-gray-700">Use this page to jot down practice notes, observations, or reminders for your current practice sessions.</p>
        </div>

        <!-- Notes collapse -->
        <div class="mt-6">
          <div :class="['collapse border rounded', { 'collapse-open': notesOpen }]">
            <div class="collapse-title text-lg font-semibold" role="button" tabindex="0" @click="notesOpen = !notesOpen">Notes</div>
            <div class="collapse-content">
              <div class="mb-4">
                <label class="inline-flex items-center mr-4">
                  <input type="checkbox" class="checkbox checkbox-sm mr-2" v-model="filterOpenOnly" />
                  <span class="text-sm">Show Open Tasks Only</span>
                </label>
                <button class="btn btn-xs btn-outline ml-2" @click="refreshNotes">Refresh</button>
              </div>

              <div class="mb-4 border p-3 rounded bg-base-100">
                <h4 class="font-medium">Add New Note</h4>
                <div class="form-control mt-2">
                  <label class="label"><span class="label-text">Title</span></label>
                  <input v-model="newNote.title" class="input input-sm input-bordered" placeholder="Short title" />
                </div>
                <div class="form-control mt-2">
                  <label class="label"><span class="label-text">Detail</span></label>
                  <textarea v-model="newNote.detail" class="textarea textarea-sm textarea-bordered" placeholder="Details or reminders"></textarea>
                </div>
                <div class="form-control mt-2">
                  <label class="label"><span class="label-text">Practice Unit</span></label>
                  <input v-model="newNote.practice_unit" class="input input-sm input-bordered" placeholder="Practice Unit or N/A" />
                </div>
                <div class="mt-3 flex gap-2">
                  <button class="btn btn-primary btn-sm" @click="createNote" :disabled="creating">Add Note</button>
                  <button class="btn btn-ghost btn-sm" @click="resetNew">Clear</button>
                </div>
              </div>

              <div>
                <div v-if="loadingNotes" class="text-sm text-gray-500">Loading notes…</div>
                <div v-else>
                  <div v-if="!notes.length" class="text-sm text-gray-500">No notes saved.</div>
                  <ul class="space-y-3">
                    <li v-for="note in filteredNotes" :key="note.id" class="border p-3 rounded bg-base-100">
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="font-semibold">{{ note.title || '(no title)' }}</div>
                          <div class="text-sm text-gray-600">{{ note.practice_unit || 'N/A' }} • <span class="text-xs text-gray-500">Created: {{ formatDate(note.created_at) }}</span></div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button class="btn btn-xs" @click="toggleStatus(note)">{{ note.status === 'open' ? 'Close' : 'Reopen' }}</button>
                          <button class="btn btn-xs btn-outline" @click="startEdit(note)">Edit</button>
                          <button class="btn btn-xs btn-error" @click="deleteNote(note)">Delete</button>
                        </div>
                      </div>
                      <div class="mt-2 text-sm" v-if="editingId !== note.id">{{ note.detail }}</div>

                      <div v-else class="mt-2">
                        <input v-model="editNote.title" class="input input-sm input-bordered mb-2" />
                        <textarea v-model="editNote.detail" class="textarea textarea-sm textarea-bordered mb-2"></textarea>
                        <input v-model="editNote.practice_unit" class="input input-sm input-bordered mb-2" />
                        <div class="flex gap-2">
                          <button class="btn btn-sm btn-primary" @click="saveEdit(note)">Save</button>
                          <button class="btn btn-sm btn-ghost" @click="cancelEdit">Cancel</button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style="max-width: 400px; margin: 2em auto">
          <RouterLink to="/practice" class="mtsFormatPracticeButtons">
            <span class="material-symbols-outlined align-middle mr-2">music_note</span>
            Return to Practice
          </RouterLink>
        </div>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import AuthStatusBanner from "./AuthStatusBanner.vue";
import { RouterLink } from "vue-router";
import { ref, onMounted, computed } from "vue";
import supabase from "../scripts/supabaseClient.js";

const notes = ref([]);
const loadingNotes = ref(false);
const creating = ref(false);
const filterOpenOnly = ref(true);
const notesOpen = ref(true);

const newNote = ref({ title: "", detail: "", practice_unit: "N/A" });
const editingId = ref(null);
const editNote = ref({ title: "", detail: "", practice_unit: "N/A" });

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

async function refreshNotes() {
  loadingNotes.value = true;
  try {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user || null;
    if (!user) {
      notes.value = [];
      return;
    }

    let query = supabase.from("mts-notes").select("*").order("created_at", { ascending: false });
    if (filterOpenOnly.value) {
      query = query.eq("user_id", user.id).eq("status", "open");
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching notes:", error);
      notes.value = [];
    } else {
      notes.value = data || [];
    }
  } catch (e) {
    console.error(e);
    notes.value = [];
  } finally {
    loadingNotes.value = false;
  }
}

async function createNote() {
  if (!newNote.value.title && !newNote.value.detail) return;
  creating.value = true;
  try {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user || null;
    if (!user) return alert("Please sign in to save notes.");

    const payload = {
      title: newNote.value.title,
      detail: newNote.value.detail,
      practice_unit: newNote.value.practice_unit || "N/A",
      user_id: user.id,
      status: "open",
    };

    const { error } = await supabase.from("mts-notes").insert(payload);
    if (error) {
      console.error("Insert error:", error);
      alert("Failed to save note.");
    } else {
      resetNew();
      await refreshNotes();
    }
  } finally {
    creating.value = false;
  }
}

function resetNew() {
  newNote.value = { title: "", detail: "", practice_unit: "N/A" };
}

function startEdit(note) {
  editingId.value = note.id;
  editNote.value = { title: note.title, detail: note.detail, practice_unit: note.practice_unit };
}

function cancelEdit() {
  editingId.value = null;
  editNote.value = { title: "", detail: "", practice_unit: "N/A" };
}

async function saveEdit(note) {
  try {
    const updates = {
      title: editNote.value.title,
      detail: editNote.value.detail,
      practice_unit: editNote.value.practice_unit,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("mts-notes").update(updates).eq("id", note.id);
    if (error) {
      console.error("Update error:", error);
      alert("Failed to update note.");
    } else {
      editingId.value = null;
      await refreshNotes();
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteNote(note) {
  if (!confirm("Delete this note?")) return;
  const { error } = await supabase.from("mts-notes").delete().eq("id", note.id);
  if (error) {
    console.error(error);
    alert("Failed to delete note.");
  } else {
    await refreshNotes();
  }
}

async function toggleStatus(note) {
  const newStatus = note.status === "open" ? "closed" : "open";
  const { error } = await supabase.from("mts-notes").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", note.id);
  if (error) {
    console.error(error);
    alert("Failed to update status.");
  } else {
    await refreshNotes();
  }
}

const filteredNotes = computed(() => {
  if (!filterOpenOnly.value) return notes.value;
  return notes.value.filter((n) => n.status === "open");
});

onMounted(async () => {
  await refreshNotes();
});
</script>
