
import nodeResolve from 'rollup-plugin-node-resolve'
import alias    from 'rollup-plugin-alias';
import uglify      from 'rollup-plugin-uglify'
import { buildOptimizer } from '@angular-devkit/build-optimizer';
const rxPaths = require('rxjs/_esm5/path-mapping');

function angularBuildOptimizer() {
  return {
    name: 'angular-optimizer',
    transform: (content) => buildOptimizer({ content }).content,
  }
}

export default {
  input: 'appjs/app/main_aot.js',
  output: {
    file: 'aot-build.min.js', // output a single application bundle
    format: 'iife'
  },
  
  onwarn: function(warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }
    
    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
      alias(rxPaths()),
      angularBuildOptimizer(),
      nodeResolve({jsnext: true, module: true}),            
      uglify()
  ]
}
