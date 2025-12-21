/**
 * Lesson Units Service Composable
 * Handles composite linking between lessons and practice units
 */
import { ref } from "vue";
import supabase, { getCurrentUserId } from "../scripts/supabaseClient.js";

export function useLessonUnitsService() {
  const lessonUnits = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch lesson units for a specific lesson with practice unit metadata
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Array>} Ordered array of practice units in the lesson
   */
  async function fetchLessonUnits(lessonId) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // First, verify the lesson belongs to the user
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("lesson_id")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error("Lesson not found or access denied");

      // Fetch lesson_units in order
      const { data: units, error: unitsError } = await supabase
        .from("lesson_units")
        .select("practice_unit_id, sort_order")
        .eq("lesson_id", lessonId)
        .order("sort_order", { ascending: true });

      if (unitsError) throw unitsError;

      const practiceUnitIds = (units || [])
        .map((u) => u.practice_unit_id)
        .filter(Boolean);

      if (practiceUnitIds.length === 0) {
        lessonUnits.value = [];
        return [];
      }

      // Fetch practice unit metadata
      const { data: practiceUnits, error: puError } = await supabase
        .from("practice_units")
        .select("practice_unit_id, name, type, unit_json")
        .in("practice_unit_id", practiceUnitIds);

      if (puError) throw puError;

      // Map practice units by ID for ordering
      const puMap = (practiceUnits || []).reduce((acc, pu) => {
        acc[pu.practice_unit_id] = pu;
        return acc;
      }, {});

      // Return ordered list with metadata
      lessonUnits.value = (units || [])
        .map((u) => ({
          practice_unit_id: u.practice_unit_id,
          sort_order: u.sort_order,
          ...puMap[u.practice_unit_id],
        }))
        .filter((u) => u.name); // Filter out any missing practice units

      return lessonUnits.value;
    } catch (e) {
      console.error("[useLessonUnitsService] fetchLessonUnits error:", e);
      error.value = e.message;
      lessonUnits.value = [];
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Add practice units to a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Array<string>} practiceUnitIds - Array of practice unit IDs to add
   * @param {number} startOrder - Starting sort order (default: 0)
   * @returns {Promise<boolean>} True if successful
   */
  async function addUnitsToLesson(lessonId, practiceUnitIds, startOrder = 0) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");
      if (!Array.isArray(practiceUnitIds) || practiceUnitIds.length === 0) {
        throw new Error("Practice unit IDs array is required");
      }

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Verify lesson ownership
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("lesson_id")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error("Lesson not found or access denied");

      // Create lesson_units entries
      const unitsPayload = practiceUnitIds.map((unitId, idx) => ({
        lesson_id: lessonId,
        practice_unit_id: unitId,
        sort_order: startOrder + idx,
      }));

      const { error: insertError } = await supabase
        .from("lesson_units")
        .insert(unitsPayload);

      if (insertError) throw insertError;

      return true;
    } catch (e) {
      console.error("[useLessonUnitsService] addUnitsToLesson error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Remove a practice unit from a lesson
   * @param {string} lessonId - Lesson ID
   * @param {string} practiceUnitId - Practice unit ID to remove
   * @returns {Promise<boolean>} True if successful
   */
  async function removeUnitFromLesson(lessonId, practiceUnitId) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");
      if (!practiceUnitId) throw new Error("Practice unit ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Verify lesson ownership
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("lesson_id")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error("Lesson not found or access denied");

      const { error: deleteError } = await supabase
        .from("lesson_units")
        .delete()
        .eq("lesson_id", lessonId)
        .eq("practice_unit_id", practiceUnitId);

      if (deleteError) throw deleteError;

      return true;
    } catch (e) {
      console.error("[useLessonUnitsService] removeUnitFromLesson error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update the complete list of units for a lesson (replaces existing)
   * @param {string} lessonId - Lesson ID
   * @param {Array<string>} orderedPracticeUnitIds - Ordered array of practice unit IDs
   * @returns {Promise<boolean>} True if successful
   */
  async function updateLessonUnits(lessonId, orderedPracticeUnitIds) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");
      if (!Array.isArray(orderedPracticeUnitIds)) {
        throw new Error("Ordered practice unit IDs must be an array");
      }

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Verify lesson ownership
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("lesson_id")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error("Lesson not found or access denied");

      // Delete existing units
      const { error: deleteError } = await supabase
        .from("lesson_units")
        .delete()
        .eq("lesson_id", lessonId);

      if (deleteError) throw deleteError;

      // Insert new units if any
      if (orderedPracticeUnitIds.length > 0) {
        const payload = orderedPracticeUnitIds.map((unitId, idx) => ({
          lesson_id: lessonId,
          practice_unit_id: unitId,
          sort_order: idx,
        }));

        const { error: insertError } = await supabase
          .from("lesson_units")
          .insert(payload);

        if (insertError) throw insertError;
      }

      return true;
    } catch (e) {
      console.error("[useLessonUnitsService] updateLessonUnits error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Reorder units in a lesson
   * @param {string} lessonId - Lesson ID
   * @param {string} practiceUnitId - Practice unit ID to move
   * @param {number} newSortOrder - New sort order position
   * @returns {Promise<boolean>} True if successful
   */
  async function reorderLessonUnit(lessonId, practiceUnitId, newSortOrder) {
    loading.value = true;
    error.value = null;
    try {
      if (!lessonId) throw new Error("Lesson ID is required");
      if (!practiceUnitId) throw new Error("Practice unit ID is required");
      if (typeof newSortOrder !== "number") {
        throw new Error("New sort order must be a number");
      }

      // Fetch current units and reorder
      const currentUnits = await fetchLessonUnits(lessonId);
      const unitIds = currentUnits.map((u) => u.practice_unit_id);
      
      // Remove the unit from its current position
      const currentIndex = unitIds.indexOf(practiceUnitId);
      if (currentIndex === -1) {
        throw new Error("Practice unit not found in lesson");
      }
      
      unitIds.splice(currentIndex, 1);
      // Insert at new position
      unitIds.splice(newSortOrder, 0, practiceUnitId);

      // Update with new order
      await updateLessonUnits(lessonId, unitIds);

      return true;
    } catch (e) {
      console.error("[useLessonUnitsService] reorderLessonUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    lessonUnits,
    loading,
    error,

    // Methods
    fetchLessonUnits,
    addUnitsToLesson,
    removeUnitFromLesson,
    updateLessonUnits,
    reorderLessonUnit,
  };
}
