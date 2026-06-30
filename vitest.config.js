import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: {
      script: 'happy-dom',
      inverse: false
    },
    include: ['src/**/*.test.js', 'server/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js', 'src/main.js']
    }
  }
})
