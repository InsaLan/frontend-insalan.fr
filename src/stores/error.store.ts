import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

export const useErrorStore = defineStore('error', () => {
  const errors = reactive<string[][]>([]);
  // const default_duration = 200;

  type ErrorMessage = { message: string; code?: number; status?: number };

  /**
   * Add an error message to the errors array
   * @param error
   * @returns true if error message was added, false otherwise
   */
  function add_error(error: string | string[] | ErrorMessage | ErrorMessage[] | { data: ErrorMessage }): boolean {
    // if error is a string, add it to the errors array
    if (typeof error === 'string') {
      // limit to 197 characters + "..."
      if (error.length > 200) return false;

      errors.push(['Erreur', error]);
      return true;
    }

    // if error is an array, add it to the errors array
    if (Array.isArray(error)) {
      error.forEach((item) => add_error(item));
      return true;
    }

    // if error is an object, add it to the errors array
    if (typeof error === 'object') {
      // if error is {data:...}
      if ('data' in error) {
        add_error(error.data);
        return true;
      }

      if (error.message) {
        if (error.message.length > 200) return false;

        // if error is {message: "message", status: "status"}
        if (error.status) {
          errors.push([String(error.status), error.message]);
          return true;
        }

        // if error is {message: "message", code: "status"}
        if (error.code) {
          errors.push([String(error.code), error.message]);
          return true;
        }

        // if error is {message: "message",...}
        errors.push(['Erreur', error.message]);
        return true;
      }
    }
    // return false if error message can't be parsed
    return false;
  }

  function flush_errors() {
    errors.splice(0, errors.length);
  }

  const has_errors = computed(() => errors.length > 0);

  return {
    errors,
    add_error,
    flush_errors,
    has_errors,
  };
});
