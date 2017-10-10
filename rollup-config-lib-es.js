import rollup from 'rollup'

export default {
  input: 'libjs/fintechneo-angulartemplates.js',
  output: {
    file: 'libdist/fintechneo-angulartemplates.js',
    format: 'es'
  },  
  sourceMap: false,  
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