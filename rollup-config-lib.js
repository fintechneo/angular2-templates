import rollup from 'rollup'
import fs from 'fs';
import path from 'path';

const copyFilePlugin = function (options) {
  return {
    ongenerate(){
      fs.writeFileSync(options.targ, fs.readFileSync(options.src));
    }
  };
}

const removeJSPlugin = function (options) {
  return {
      ongenerate(){
          let walkSync = (dir, filelist) => {            
            let files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function(file) {
              if (fs.statSync(dir + file).isDirectory()) {
                filelist = walkSync(dir + file + '/', filelist);
              }
              else {
                filelist.push(dir+file);
              }
            });
            return filelist;
        };
        walkSync(options.src)
          .filter(path => 
              path.indexOf(options.except)===-1 && (
                  path.indexOf(".js")===path.length-3 ||
                  path.indexOf(".js.map")===path.length-7
              )
          )
          .forEach(path => fs.unlinkSync(path));
        
      }
  };
};

export default {
  entry: 'libdist/fintechneo-angulartemplates.js',
  dest: 'libdist/fintechneo-angulartemplates.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'fintechneo.angulartemplates',
  onwarn: function(warning) {   
    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
    copyFilePlugin({src: "libdist-package.json", 
      targ: "libdist/package.json"})
    /*removeJSPlugin({
        src:  'dist/',
        except: "fintechneo-angulartemplates.umd.js"        
    })*/
  ],
  globals: {  
    
  }
}