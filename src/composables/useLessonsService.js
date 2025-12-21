/**
 * Lessons Service Composable
 * Handles all CRUD operations for lessons
 */
import { ref } from "vue";
import supabase, { getCurrentUserId } from "../scripts/supabaseClient.js";

export function useLessonsService() {
  const lessons = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch all lessons for the current user
   * @returns {Promise<Array>} Array of lesson objects
   */
  async function fetchLessons() {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const { data, error: fetchError } = await supabase
        .from("lessons")
        .select("lesson_id, lesson_name, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      lessons.value = data || [];
      return data || [];
    } catch (e) {
      console.error("[useLessonsService] fetchLessons error:", e);
      error.value = e.message;
      lessons.value = [];
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single lesson by ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object|null>} Lesson object or null
   */
  async function getLesson(lessonId) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("lessons")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (e) {
      console.error("[useLessonsService] getLesson error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new lesson
   * @param {string} lessonName - Name of the lesson
   * @param {Array} practiceUnitIds - Optional array of practice unit IDs to link
   * @returns {Promise<Object>} Created lesson with lesson_id
   */
  async function createLesson(lessonName, practiceUnitIds = []) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonName?.trim()) {
        throw new Error("Lesson name is required");
      }

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Insert the lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .insert({
          user_id: userId,
          lesson_name: lessonName.trim(),
        })
        .select("lesson_id")
        .single();

      if (lessonError) throw lessonError;

      const lessonId = lessonData.lesson_id;

      // If practice unit IDs provided, create lesson_units
      if (practiceUnitIds && practiceUnitIds.length > 0) {
        const unitsPayload = practiceUnitIds.map((unitId, idx) => ({
          lesson_id: lessonId,
          practice_unit_id: unitId,
          sort_order: idx,
        }));

        const { error: unitsError } = await supabase
          .from("lesson_units")
          .insert(unitsPayload);

        if (unitsError) throw unitsError;
      }

      return { lessonId, ...lessonData };
    } catch (e) {
      console.error("[useLessonsService] createLesson error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update a lesson's name
   * @param {string} lessonId - Lesson ID
   * @param {string} newName - New name for the lesson
   * @returns {Promise<Object>} Updated lesson
   */
  async function updateLessonName(lessonId, newName) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");
      if (!newName?.trim()) throw new Error("Lesson name is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { data, error: updateError } = await supabase
        .from("lessons")
        .update({ lesson_name: newName.trim() })
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (e) {
      console.error("[useLessonsService] updateLessonName error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a lesson and its associated lesson_units
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<boolean>} True if successful
   */
  async function deleteLesson(lessonId) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Delete associated lesson_units first (due to foreign key)
      const { error: unitsError } = await supabase
        .from("lesson_units")
        .delete()
        .eq("lesson_id", lessonId);

      if (unitsError) throw unitsError;

      // Delete the lesson
      const { error: lessonError } = await supabase
        .from("lessons")
        .delete()
        .eq("lesson_id", lessonId)
        .eq("user_id", userId);

      if (lessonError) throw lessonError;

      return true;
    } catch (e) {
      console.error("[useLessonsService] deleteLesson error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    lessons,
    loading,
    error,

    // Methods
    fetchLessons,
    getLesson,
    createLesson,
    updateLessonName,
    deleteLesson,
  };
}
