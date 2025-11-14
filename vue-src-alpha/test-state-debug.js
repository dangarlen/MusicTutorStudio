// Quick test to verify our state management imports work
import { useAppStateStore } from './stores/appStateStore.js';
import { useActiveUnitStatus } from './composables/useActiveUnitStatus.js';
import { validatePracticeUnit } from './types/index.js';

console.log('Testing state management imports...');
console.log('✓ AppStateStore imported');
console.log('✓ useActiveUnitStatus imported');  
console.log('✓ validatePracticeUnit imported');
console.log('State management setup appears to be working correctly!');