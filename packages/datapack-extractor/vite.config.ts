import { resolve } from 'path';
import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';

const PROJECT_ROOT = resolve(__dirname, '../../');

export default defineConfig({
  plugins: [
    {
      ...nodeExternals(),
      enforce: 'pre',
      apply: 'build',
    },
  ],
  define: {
    PROJECT_ROOT: JSON.stringify(PROJECT_ROOT),
    WORLD_ROOT: JSON.stringify(resolve(PROJECT_ROOT, './world')),
    DATAPACK_ROOT: JSON.stringify(resolve(PROJECT_ROOT, './world/datapacks/manosaba')),
  },
  resolve: {
    mainFields: [ 'module', 'jsnext:main', 'jsnext' ],
    conditions: [ 'node' ],
  }
});
