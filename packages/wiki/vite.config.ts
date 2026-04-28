import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite';
import { presetWind4 } from 'unocss';
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [ presetWind4() ],
    }),
    preact(),
  ],
})
