// Pinia store for creating/saving Lessons
import { defineStore } from "pinia";
import supabase from "../scripts/supabaseClient.js";

export const useLessonStore = defineStore("lessonStore", {
  state: () => ({
    lessonName: "",
    availableUnits: [], // fetched from Supabase
    availableLessons: [], // user's lessons list
    loading: false,
    error: null,
    lessonsLoading: false,
    lessonsError: null,
    selectedUnits: [], // array of unit objects in order
  }),
  getters: {
    isReady(state) {
      return !state.loading && !state.error;
    },
  },
  actions: {
    async fetchPracticeUnits() {
      this.loading = true;
      this.error = null;
      try {
        // Ensure user session
        const { data: sessData, error: sessErr } =
          await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        const user = sessData?.session?.user;
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("practice_units")
          .select("practice_unit_id, name, type, unit_json, last_modified")
          .eq("user_id", user.id)
          .order("last_modified", { ascending: false });
        if (error) throw error;
        // Normalize shape for UI convenience
        this.availableUnits = (data || []).map((row) => {
          // instrument often lives inside unit_json.practiceUnitHeader.instrument
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
            instrument, // may be object or string
            unit_json: row.unit_json,
            last_modified: row.last_modified,
          };
        });
      } catch (e) {
        // Surface the database error to the UI while still attempting the
        // localStorage fallback. Previously this only logged to console; make
        // it visible so users know why the DB data couldn't be loaded.
        console.warn(
          "[lessonStore] fetchPracticeUnits failed; falling back to localStorage",
          e
        );
        // Set a descriptive error message that will be shown in the Create
        // Lessons UI (AuthStatusBanner/alert area). Keep the original error
        // message when available.
        this.error =
          e?.message
            ? `[lessonStore] ${e.message} — falling back to localStorage`
            : "[lessonStore] Failed to fetch practice units from database; falling back to localStorage";
        // Fallback: try to read an export blob from localStorage (convention key)
        try {
          const raw = localStorage.getItem("mts.practiceUnits.export");
          if (raw) {
            const arr = JSON.parse(raw);
            // Attempt to normalize fallback rows to expected shape
            this.availableUnits = (Array.isArray(arr) ? arr : []).map((u) => ({
              practice_unit_id:
                u.practice_unit_id || u.id || crypto.randomUUID?.(),
              name: u.name || u.practice_name || "(untitled)",
              type: u.type || u.practice_unit_type || "Scale",
              instrument:
                u.instrument ||
                u?.unit_json?.practiceUnitHeader?.instrument ||
                null,
              unit_json: u.unit_json || u,
              last_modified: u.last_modified || new Date().toISOString(),
            }));
          } else {
            this.availableUnits = [];
          }
        } catch (e2) {
          console.warn("[lessonStore] localStorage fallback failed", e2);
          this.availableUnits = [];
          // If both DB and localStorage fallback fail, surface that clearly
          // to the UI so users can take action (e.g., check network/plugins).
          this.error =
            e2?.message || e?.message || "Unable to load practice units";
        }
      } finally {
        this.loading = false;
      }
    },

    addUnit(unit) {
      if (!unit) return;
      const exists = this.selectedUnits.some(
        (u) => u.practice_unit_id === unit.practice_unit_id
      );
      if (!exists) this.selectedUnits.push(unit);
    },

    removeUnit(unitId) {
      this.selectedUnits = this.selectedUnits.filter(
        (u) => u.practice_unit_id !== unitId
      );
    },

    moveUnit(oldIndex, newIndex) {
      if (
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= this.selectedUnits.length ||
        newIndex >= this.selectedUnits.length
      )
        return;
      const [u] = this.selectedUnits.splice(oldIndex, 1);
      this.selectedUnits.splice(newIndex, 0, u);
    },

    clear() {
      this.lessonName = "";
      this.selectedUnits = [];
    },

    // Save lesson to Supabase; shape: lessons with lesson_units (1..n)
    async saveLesson() {
      if (!this.lessonName?.trim()) throw new Error("Lesson name is required");
      if (this.selectedUnits.length === 0)
        throw new Error("Add at least one Practice Unit");

      const { data: sessData, error: sessErr } =
        await supabase.auth.getSession();
      if (sessErr) throw sessErr;
      const user = sessData?.session?.user;
      if (!user) throw new Error("Not authenticated");

      // Upsert lesson
      const lessonRow = {
        user_id: user.id,
        lesson_name: this.lessonName.trim(),
      };

      const { data: lessonInsert, error: lessonErr } = await supabase
        .from("lessons")
        .insert(lessonRow)
        .select("lesson_id")
        .single();
      if (lessonErr) throw lessonErr;
      const lessonId = lessonInsert.lesson_id;

      // Insert lesson units in order
      const unitsPayload = this.selectedUnits.map((u, idx) => ({
        lesson_id: lessonId,
        practice_unit_id: u.practice_unit_id,
        sort_order: idx,
      }));
      const { error: unitsErr } = await supabase
        .from("lesson_units")
        .insert(unitsPayload);
      if (unitsErr) throw unitsErr;

      return { lessonId };
    },

    // --- Lessons management (read / update / delete) ---
    async fetchLessons() {
      this.lessonsLoading = true;
      this.lessonsError = null;
      try {
        const { data: sessData, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        const user = sessData?.session?.user;
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("lessons")
          .select("lesson_id, lesson_name, created_at, updated_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        this.availableLessons = data || [];
      } catch (e) {
        console.warn("[lessonStore] fetchLessons failed", e);
        this.availableLessons = [];
        this.lessonsError = e?.message || "Unable to load lessons";
      } finally {
        this.lessonsLoading = false;
      }
    },

    async updateLessonName(lessonId, newName) {
      if (!lessonId) throw new Error("lessonId required");
      try {
        const { data, error } = await supabase
          .from("lessons")
          .update({ lesson_name: newName })
          .eq("lesson_id", lessonId);
        if (error) throw error;
        // refresh local list
        await this.fetchLessons();
        return data;
      } catch (e) {
        console.warn("[lessonStore] updateLessonName failed", e);
        throw e;
      }
    },

    async deleteLesson(lessonId) {
      if (!lessonId) throw new Error("lessonId required");
      try {
        // delete associated lesson_units first
        const { error: delUnitsErr } = await supabase
          .from("lesson_units")
          .delete()
          .eq("lesson_id", lessonId);
        if (delUnitsErr) throw delUnitsErr;

        const { error: delLessonErr } = await supabase
          .from("lessons")
          .delete()
          .eq("lesson_id", lessonId);
        if (delLessonErr) throw delLessonErr;

        // refresh local list
        await this.fetchLessons();
        return true;
      } catch (e) {
        console.warn("[lessonStore] deleteLesson failed", e);
        throw e;
      }
    },

    // Fetch the lesson_units and associated practice unit metadata for a lesson
    async fetchLessonUnits(lessonId) {
      if (!lessonId) throw new Error("lessonId required");
      try {
        const { data: units, error: unitsErr } = await supabase
          .from("lesson_units")
          .select("practice_unit_id, sort_order")
          .eq("lesson_id", lessonId)
          .order("sort_order", { ascending: true });
        if (unitsErr) throw unitsErr;

        const puIds = (units || []).map((u) => u.practice_unit_id).filter(Boolean);
        if (puIds.length === 0) return [];

        const { data: pus, error: pusErr } = await supabase
          .from("practice_units")
          .select("practice_unit_id, name, type, unit_json")
          .in("practice_unit_id", puIds);
        if (pusErr) throw pusErr;

        // Map practice units by id for ordering
        const map = (pus || []).reduce((acc, p) => {
          acc[p.practice_unit_id] = p;
          return acc;
        }, {});

        // Return ordered list with metadata
        return (units || []).map((u) => ({
          practice_unit_id: u.practice_unit_id,
          sort_order: u.sort_order,
          ...map[u.practice_unit_id],
        }));
      } catch (e) {
        console.warn("[lessonStore] fetchLessonUnits failed", e);
        throw e;
      }
    },

    // Replace lesson units for a lesson with provided ordered array of practice_unit_ids
    async updateLessonUnits(lessonId, orderedPracticeUnitIds) {
      if (!lessonId) throw new Error("lessonId required");
      if (!Array.isArray(orderedPracticeUnitIds))
        throw new Error("orderedPracticeUnitIds must be an array");
      try {
        // Delete existing units
        const { error: delErr } = await supabase
          .from("lesson_units")
          .delete()
          .eq("lesson_id", lessonId);
        if (delErr) throw delErr;

        // Insert new units with sort order
        const payload = orderedPracticeUnitIds.map((pid, idx) => ({
          lesson_id: lessonId,
          practice_unit_id: pid,
          sort_order: idx,
        }));
        if (payload.length === 0) return true;
        const { error: insErr } = await supabase
          .from("lesson_units")
          .insert(payload);
        if (insErr) throw insErr;

        return true;
      } catch (e) {
        console.warn("[lessonStore] updateLessonUnits failed", e);
        throw e;
      }
    },
  },
});
