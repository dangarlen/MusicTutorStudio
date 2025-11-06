import { defineStore } from "pinia";

export const useNameStore = defineStore("name", {
  state: () => ({
    name: "",
  }),
  actions: {
    setName(newName) {
      this.name = newName;
    },
  },
});
