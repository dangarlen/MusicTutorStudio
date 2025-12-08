/**
 * TestLog Service Composable
 * Handles diagnostic logging operations (public table with no RLS for now)
 */
import { ref } from "vue";
import supabase from "../scripts/supabaseClient.js";

export function useTestLogService() {
  const logs = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Insert a test log entry
   * @param {Object} logEntry - Log entry data
   * @param {string} logEntry.test_name - Name/identifier of the test
   * @param {string} logEntry.status - Status ('success', 'failure', 'info', etc.)
   * @param {string} logEntry.message - Log message
   * @param {Object} logEntry.metadata - Additional metadata (JSON)
   * @returns {Promise<Object>} Created log entry
   */
  async function insertLog(logEntry) {
    loading.value = true;
    error.value = null;
    try {
      if (!logEntry.test_name) {
        throw new Error("Test name is required");
      }

      const payload = {
        test_name: logEntry.test_name,
        status: logEntry.status || "info",
        message: logEntry.message || "",
        metadata: logEntry.metadata || {},
        created_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("TestLog")
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (e) {
      console.error("[useTestLogService] insertLog error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch test logs
   * @param {Object} options - Query options
   * @param {string} options.test_name - Filter by test name
   * @param {string} options.status - Filter by status
   * @param {number} options.limit - Maximum number of logs to fetch (default: 100)
   * @param {string} options.orderBy - Column to order by (default: 'created_at')
   * @param {boolean} options.ascending - Sort order (default: false)
   * @returns {Promise<Array>} Array of log entries
   */
  async function fetchLogs(options = {}) {
    loading.value = true;
    error.value = null;
    try {
      const {
        test_name = null,
        status = null,
        limit = 100,
        orderBy = "created_at",
        ascending = false,
      } = options;

      let query = supabase.from("TestLog").select("*");

      // Filter by test name if specified
      if (test_name) {
        query = query.eq("test_name", test_name);
      }

      // Filter by status if specified
      if (status) {
        query = query.eq("status", status);
      }

      // Limit results
      query = query.limit(limit);

      // Order results
      query = query.order(orderBy, { ascending });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      logs.value = data || [];
      return data || [];
    } catch (e) {
      console.error("[useTestLogService] fetchLogs error:", e);
      error.value = e.message;
      logs.value = [];
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single log entry by ID
   * @param {string} logId - Log entry ID
   * @returns {Promise<Object|null>} Log entry or null
   */
  async function getLog(logId) {
    loading.value = true;
    error.value = null;
    try {
      if (!logId) throw new Error("Log ID is required");

      const { data, error: fetchError } = await supabase
        .from("TestLog")
        .select("*")
        .eq("id", logId)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (e) {
      console.error("[useTestLogService] getLog error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete old log entries
   * @param {number} daysOld - Delete logs older than this many days
   * @returns {Promise<number>} Number of deleted entries
   */
  async function deleteOldLogs(daysOld = 30) {
    loading.value = true;
    error.value = null;
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffIso = cutoffDate.toISOString();

      const { data, error: deleteError } = await supabase
        .from("TestLog")
        .delete()
        .lt("created_at", cutoffIso)
        .select("id");

      if (deleteError) throw deleteError;

      return (data || []).length;
    } catch (e) {
      console.error("[useTestLogService] deleteOldLogs error:", e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Convenience method to log a success event
   * @param {string} testName - Test/event name
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created log entry
   */
  async function logSuccess(testName, message, metadata = {}) {
    return insertLog({
      test_name: testName,
      status: "success",
      message,
      metadata,
    });
  }

  /**
   * Convenience method to log a failure event
   * @param {string} testName - Test/event name
   * @param {string} message - Failure message
   * @param {Object} metadata - Additional metadata (e.g., error details)
   * @returns {Promise<Object>} Created log entry
   */
  async function logFailure(testName, message, metadata = {}) {
    return insertLog({
      test_name: testName,
      status: "failure",
      message,
      metadata,
    });
  }

  /**
   * Convenience method to log an info event
   * @param {string} testName - Test/event name
   * @param {string} message - Info message
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created log entry
   */
  async function logInfo(testName, message, metadata = {}) {
    return insertLog({
      test_name: testName,
      status: "info",
      message,
      metadata,
    });
  }

  return {
    // State
    logs,
    loading,
    error,

    // Methods
    insertLog,
    fetchLogs,
    getLog,
    deleteOldLogs,

    // Convenience methods
    logSuccess,
    logFailure,
    logInfo,
  };
}
