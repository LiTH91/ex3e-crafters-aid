import type { Charm } from './types';

export const allCharms: Charm[] = [
  {
    id: 'flawless-handiwork',
    name: 'Flawless Handiwork Method',
    description: 'Adds automatic successes to a crafting roll.',
    minCraft: 1,
    minEssence: 1,
    effect: { type: 'add_successes', value: 3 }, // Example value
  },
  {
    id: 'first-movement-demiurge',
    name: 'First Movement of the Demiurge',
    description: 'Reroll all dice that did not result in a success.',
    minCraft: 3,
    minEssence: 2,
    effect: { type: 'reroll_failures', value: 0 },
  },
  {
    id: 'unbroken-concentration',
    name: 'Unbroken Concentration Trance',
    description: 'Adds more automatic successes for complex projects.',
    minCraft: 5,
    minEssence: 3,
    effect: { type: 'add_successes', value: 5 }, // Example value
  },
];
