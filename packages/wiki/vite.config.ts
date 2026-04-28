import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite';
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    preact(),
  ],
})
