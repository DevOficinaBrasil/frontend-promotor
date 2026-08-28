const nextJest = require('next/jest');

// next/jest usa o SWC do Next: transpila TS e resolve o alias `@/` do tsconfig.
// Só funções puras são testadas aqui, então `node` basta — sem RTL, sem jsdom.
const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  passWithNoTests: true,
});
