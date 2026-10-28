import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // three.js only loads with the lazy hero and next-step scenes. Kept apart from the app
        // code it stays cached across deploys, and its core is split from the rest so no chunk
        // passes the 500 kB warning. three has no dependencies, so its groups don't take any
        // shared module (react) that would make the entry preload them. R3F and drei stay with
        // the scenes: split off without their own dependencies they import each other in a
        // cycle that breaks at load.
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            {
              name: 'three-core',
              test: /node_modules[\\/]three[\\/]build[\\/]three\.core/,
              priority: 2,
            },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
