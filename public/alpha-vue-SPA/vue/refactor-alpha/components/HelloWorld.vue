<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div style="margin: 1em 0">
      <label for="name-input">Name: </label>
      <input
        id="name-input"
        v-model="nameStore.name"
        placeholder="Enter your name"
      />
      <button @click="saveName">Save</button>
    </div>
    <div v-if="nameStore.name">
      <strong>Saved Name:</strong> {{ nameStore.name }}
    </div>
    <button @click="goToHelloTwo">Go to Hello from Vue Two</button>
    <p>
      Edit <code>components/HelloWorld.vue</code> to test hot module
      replacement.
    </p>
    <p>Current time: {{ time }}</p>
    <button @click="updateTime">Get Time</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getTime } from "../scripts/vue-test-getTime.js";
import { useNameStore } from "../stores/name.js";

const props = defineProps({
  msg: String,
});

const time = ref(getTime());
const router = useRouter();
const nameStore = useNameStore();

function goToHelloTwo() {
  router.push("/hello-two");
}
function updateTime() {
  time.value = getTime();
}
function saveName() {
  nameStore.setName(nameStore.name);
}
</script>

<style scoped>
.hello {
  text-align: center;
}
</style>
