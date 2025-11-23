<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">State Management Debug</h1>
    
    <div class="mb-4">
      <h2 class="text-lg font-bold">AppState Status:</h2>
      <p>Has Active Unit: {{ hasActiveUnit }}</p>
      <p>Active Unit Display Name: "{{ activeUnitDisplayName }}"</p>
      <p>Is In Lesson Mode: {{ isInLessonMode }}</p>
      <p>Is In Quick Practice Mode: {{ isInQuickPracticeMode }}</p>
    </div>
    
    <div class="mb-4">
      <h2 class="text-lg font-bold">Empty State Message Test:</h2>
      <EmptyStateMessage 
        :context="{ page: 'debug', hasActiveUnit, isInLessonMode }"
        size="medium"
        :showActions="true"
      />
    </div>
    
    <div class="mb-4">
      <button @click="testCreateUnit" class="btn btn-primary mr-2">Create Test Unit</button>
      <button @click="testClearUnit" class="btn btn-secondary">Clear Unit</button>
    </div>
  </div>
</template>

<script setup>
import { useActiveUnitStatus } from '../composables/useActiveUnitStatus.js';
import { useAppStateStore } from '../stores/appStateStore.js';
import EmptyStateMessage from './EmptyStateMessage.vue';

const appState = useAppStateStore();
const { 
  hasActiveUnit,
  activeUnitDisplayName,
  isInLessonMode,
  isInQuickPracticeMode 
} = useActiveUnitStatus();

function testCreateUnit() {
  const testUnit = {
    practiceUnitHeader: {
      practiceName: 'Debug Test Scale',
      practiceUnitType: 'Scale',
      instrument: { name: 'Euphonium', clef: 'treble' }
    },
    noteArray: [
      { pitch: 'C4', duration: 'quarter' },
      { pitch: 'D4', duration: 'quarter' },
      { pitch: 'E4', duration: 'quarter' }
    ]
  };
  
  appState.loadActiveUnit(testUnit, 'quick');
  console.log('Test unit created:', testUnit);
}

function testClearUnit() {
  appState.clearActiveUnit();
  console.log('Unit cleared');
}
</script>