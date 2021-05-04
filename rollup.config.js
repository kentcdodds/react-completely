import commonjs from '@rollup/plugin-commonjs'
import {babel} from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import * as config from 'kcd-scripts/dist/config/rollup.config'

const babelPluginIndex = config.plugins.findIndex(
  plugin => plugin.name === 'babel',
)
const typescriptPluginIndex = config.plugins.findIndex(
  plugin => plugin.name === 'typescript',
)
const cjsPluginIndex = config.plugins.findIndex(
  plugin => plugin.name === 'commonjs',
)
config.plugins[babelPluginIndex] = babel({
  babelHelpers: 'runtime',
  exclude: '**/node_modules/**',
})
config.plugins[cjsPluginIndex] = commonjs({
  include: 'node_modules/**',
})

if (typescriptPluginIndex === -1) {
  config.plugins.push(typescript({tsconfig: 'tsconfig.json'}))
} else {
  config.plugins[typescriptPluginIndex] = typescript({
    tsconfig: 'tsconfig.json',
  })
}

module.exports = config
