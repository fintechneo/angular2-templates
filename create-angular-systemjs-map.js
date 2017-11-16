const fs = require('fs');

fs.readdirSync("node_modules/@angular")
    .map(d => "node_modules/@angular/"+d+"/bundles")
    .filter((d) => fs.existsSync(d))
    .forEach((d) => 
    fs.readdirSync(d)
        .filter(m => m.endsWith(".min.js"))
        .map(m => 
            "'"+((p) => 
                p[1]+"/"+p[2]+
                (p[4].startsWith(p[2]+".") ? "" : "/"+p[4].substr(p[2].length+1).split(".")[0])
            )
            ((d+"/"+m).split("/"))+"': '"+d+"/"+m+"',"
        )
        .forEach(m => console.log(m))
);