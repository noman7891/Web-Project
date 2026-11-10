import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false, // Run test files sequentially to share the in-memory MongoDB instance
    hookTimeout: 180000,   // Allow sufficient time for initial binary download
    testTimeout: 30000,
  },
})

