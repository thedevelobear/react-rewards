import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import svg from 'rollup-plugin-svg';

const name = require('./package.json').main.replace(/\.js$/, '')

const ext = format =>
    format === 'dts' ? 'd.ts' : format === 'cjs' ? 'js' : 'es.js'

const bundle = format => ({
  input: 'src/index.ts',
  output: {
    file: `${name}.${ext(format)}`,
    format: format === 'cjs' ? 'cjs' : 'es',
    sourcemap: format !== 'dts',
  },
  plugins: format === 'dts' ? [dts()] : [svg(), esbuild({minify: true})],
  external: id => !/^[./]/.test(id),
})

export default [
  bundle('es'),
  bundle('cjs'),
  bundle('dts'),
]
