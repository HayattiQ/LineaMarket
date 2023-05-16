import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-polyfill-node'
const MODE = process.env.NODE_ENV
const development = MODE === 'development'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  development &&
  nodePolyfills({
    include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
    // @ts-ignore
    http: true,
    // @ts-ignore
    crypto: true
  })
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert'
    }
  },
  build: {
    rollupOptions: {
      // @ts-ignore
      plugins: [nodePolyfills({ crypto: true, http: true })]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
