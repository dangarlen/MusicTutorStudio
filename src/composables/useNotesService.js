/**
 * Notes Service Composable
 * Handles all CRUD operations for private practice notes (mts-notes table)
 */
import { ref } from "vue";
import supabase, { getCurrentUserId } from "../scripts/supabaseClient.js";

export function useNotesService() {
  const notes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch all notes for the current user
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status ('open' or 'closed')
   * @param {string} options.orderBy - Column to order by (default: 'created_at')
   * @param {boolean} options.ascending - Sort order (default: false)
   * @returns {Promise<Array>} Array of note objects
   */
  async function fetchNotes(options = {}) {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const {
        status = null,
        orderBy = "created_at",
        ascending = false,
      } = options;

      let query = supabase
        .from("mts-notes")
        .select("*")
        .eq("user_id", userId);

      // Filter by status if specified
      if (status) {
        query = query.eq("status", status);
      }

      // Order results
      query = query.order(orderBy, { ascending });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      notes.value = data || [];
      return data || [];
    } catch (e) {
      console.error("[useNotesService] fetchNotes error:", e);
      error.value = e.message;
      notes.value = [];
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single note by ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object|null>} Note object or null
   */
  async function getNote(noteId) {
    loading.value = true;
    error.value = null;
    try {
      if (!noteId) throw new Error("Note ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("mts-notes")
        .select("*")
        .eq("id", noteId)
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (e) {
      console.error("[useNotesService] getNote error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new note
   * @param {Object} note - Note data
   * @param {string} note.title - Note title
   * @param {string} note.detail - Note detail/content
   * @param {string} note.practice_unit - Associated practice unit (optional)
   * @param {string} note.status - Note status (default: 'open')
   * @returns {Promise<Object>} Created note with ID
   */
  async function createNote(note) {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      if (!note.title?.trim()) {
        throw new Error("Note title is required");
      }

      const payload = {
        user_id: userId,
        title: note.title.trim(),
        detail: note.detail || "",
        practice_unit: note.practice_unit || null,
        status: note.status || "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("mts-notes")
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (e) {
      console.error("[useNotesService] createNote error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update a note
   * @param {string} noteId - Note ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated note
   */
  async function updateNote(noteId, updates) {
    loading.value = true;
    error.value = null;
    try {
      if (!noteId) throw new Error("Note ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from("mts-notes")
        .update(updateData)
        .eq("id", noteId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (e) {
      console.error("[useNotesService] updateNote error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a note
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} True if successful
   */
  async function deleteNote(noteId) {
    loading.value = true;
    error.value = null;
    try {
      if (!noteId) throw new Error("Note ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { error: deleteError } = await supabase
        .from("mts-notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      return true;
    } catch (e) {
      console.error("[useNotesService] deleteNote error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Toggle note status between open and closed
   * @param {string} noteId - Note ID
   * @param {string} newStatus - New status ('open' or 'closed')
   * @returns {Promise<Object>} Updated note
   */
  async function toggleNoteStatus(noteId, newStatus) {
    return updateNote(noteId, { status: newStatus });
  }

  /**
   * Fetch notes filtered by practice unit
   * @param {string} practiceUnit - Practice unit name/ID
   * @returns {Promise<Array>} Array of notes for the practice unit
   */
  async function fetchNotesByPracticeUnit(practiceUnit) {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("mts-notes")
        .select("*")
        .eq("user_id", userId)
        .eq("practice_unit", practiceUnit)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (e) {
      console.error("[useNotesService] fetchNotesByPracticeUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    notes,
    loading,
    error,

    // Methods
    fetchNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteStatus,
    fetchNotesByPracticeUnit,
  };
}
