import rollup from 'rollup'
import fs from 'fs';
import path from 'path';

export default {
  entry: 'dist/index.js',
  dest: 'dist/fintechneo-angulartemplates.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'fintechneo.angulartemplates',
  onwarn: function(warning) {
   
    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
    
  ],
  globals: {  
    
  }
}