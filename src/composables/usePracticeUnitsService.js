/**
 * Practice Units Service Composable
 * Handles all CRUD operations for practice units with shared/public filtering
 */
import { ref } from "vue";
import supabase, { getCurrentUserId } from "../scripts/supabaseClient.js";

export function usePracticeUnitsService() {
  const practiceUnits = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch practice units for the current user
   * @param {Object} options - Query options
   * @param {boolean} options.includeShared - Include shared/public units
   * @param {string} options.type - Filter by type (e.g., 'Scale', 'Exercise')
   * @param {string} options.orderBy - Column to order by (default: 'last_modified')
   * @param {boolean} options.ascending - Sort order (default: false)
   * @returns {Promise<Array>} Array of practice unit objects
   */
  async function fetchPracticeUnits(options = {}) {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const {
        includeShared = false,
        type = null,
        orderBy = "last_modified",
        ascending = false,
      } = options;

      let query = supabase
        .from("practice_units")
        .select("practice_unit_id, name, type, unit_json, last_modified, user_id, is_public");

      // Filter by user or include shared/public units
      if (includeShared) {
        // Get user's units OR public units
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        // Only user's units
        query = query.eq("user_id", userId);
      }

      // Filter by type if specified
      if (type) {
        query = query.eq("type", type);
      }

      // Order results
      query = query.order(orderBy, { ascending });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Normalize data with instrument extraction
      practiceUnits.value = (data || []).map((row) => {
        let instrument = null;
        try {
          const uj = row.unit_json || {};
          const inst = uj?.practiceUnitHeader?.instrument || uj?.instrument;
          instrument = inst || null;
        } catch (_) {
          instrument = null;
        }

        return {
          practice_unit_id: row.practice_unit_id,
          name: row.name,
          type: row.type,
          instrument,
          unit_json: row.unit_json,
          last_modified: row.last_modified,
          user_id: row.user_id,
          is_public: row.is_public || false,
        };
      });

      return practiceUnits.value;
    } catch (e) {
      console.error("[usePracticeUnitsService] fetchPracticeUnits error:", e);
      error.value = e.message;
      practiceUnits.value = [];
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single practice unit by ID
   * @param {string} practiceUnitId - Practice unit ID
   * @returns {Promise<Object|null>} Practice unit object or null
   */
  async function getPracticeUnit(practiceUnitId) {
    loading.value = true;
    error.value = null;
    try {
      if (!practiceUnitId) throw new Error("Practice unit ID is required");

      const { data, error: fetchError } = await supabase
        .from("practice_units")
        .select("*")
        .eq("practice_unit_id", practiceUnitId)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (e) {
      console.error("[usePracticeUnitsService] getPracticeUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new practice unit
   * @param {Object} practiceUnit - Practice unit data
   * @param {string} practiceUnit.name - Unit name
   * @param {string} practiceUnit.type - Unit type (e.g., 'Scale', 'Exercise')
   * @param {Object} practiceUnit.unit_json - Unit JSON data
   * @param {boolean} practiceUnit.is_public - Whether unit is public/shared
   * @returns {Promise<Object>} Created practice unit with practice_unit_id
   */
  async function createPracticeUnit(practiceUnit) {
    loading.value = true;
    error.value = null;
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      if (!practiceUnit.name?.trim()) {
        throw new Error("Practice unit name is required");
      }

      const row = {
        user_id: userId,
        name: practiceUnit.name.trim(),
        type: practiceUnit.type || "Scale",
        unit_json: practiceUnit.unit_json || {},
        is_public: practiceUnit.is_public || false,
        last_modified: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("practice_units")
        .insert(row)
        .select("practice_unit_id")
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (e) {
      console.error("[usePracticeUnitsService] createPracticeUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update a practice unit
   * @param {string} practiceUnitId - Practice unit ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated practice unit
   */
  async function updatePracticeUnit(practiceUnitId, updates) {
    loading.value = true;
    error.value = null;
    try {
      if (!practiceUnitId) throw new Error("Practice unit ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      // Add last_modified timestamp
      const updateData = {
        ...updates,
        last_modified: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from("practice_units")
        .update(updateData)
        .eq("practice_unit_id", practiceUnitId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (e) {
      console.error("[usePracticeUnitsService] updatePracticeUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a practice unit
   * @param {string} practiceUnitId - Practice unit ID
   * @returns {Promise<boolean>} True if successful
   */
  async function deletePracticeUnit(practiceUnitId) {
    loading.value = true;
    error.value = null;
    try {
      if (!practiceUnitId) throw new Error("Practice unit ID is required");

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const { error: deleteError } = await supabase
        .from("practice_units")
        .delete()
        .eq("practice_unit_id", practiceUnitId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      return true;
    } catch (e) {
      console.error("[usePracticeUnitsService] deletePracticeUnit error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Toggle public/private status of a practice unit
   * @param {string} practiceUnitId - Practice unit ID
   * @param {boolean} isPublic - Whether unit should be public
   * @returns {Promise<Object>} Updated practice unit
   */
  async function togglePublicStatus(practiceUnitId, isPublic) {
    return updatePracticeUnit(practiceUnitId, { is_public: isPublic });
  }

  return {
    // State
    practiceUnits,
    loading,
    error,

    // Methods
    fetchPracticeUnits,
    getPracticeUnit,
    createPracticeUnit,
    updatePracticeUnit,
    deletePracticeUnit,
    togglePublicStatus,
  };
}
