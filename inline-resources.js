"use strict";
/* tslint:disable:no-eval */
exports.__esModule = true;
var path_1 = require("path");
var fs_1 = require("fs");
var glob_1 = require("glob");
/** Finds all JavaScript files in a directory and inlines all resources of Angular components. */
function inlineResourcesForDirectory(folderPath) {
    glob_1.sync(path_1.join(folderPath, '**/*.ts')).forEach(function (filePath) { return inlineResources(filePath); });
}
exports.inlineResourcesForDirectory = inlineResourcesForDirectory;
/** Inlines the external resources of Angular components of a file. */
function inlineResources(filePath) {
    console.log("Inlining resources", filePath);
    var fileContent = fs_1.readFileSync(filePath, 'utf-8');
    fileContent = inlineTemplate(fileContent, filePath);
    fileContent = inlineStyles(fileContent, filePath);
    fileContent = removeModuleId(fileContent);
    fs_1.writeFileSync(filePath, fileContent, 'utf-8');
}
exports.inlineResources = inlineResources;
/** Inlines the templates of Angular components for a specified source file. */
function inlineTemplate(fileContent, filePath) {
    return fileContent.replace(/templateUrl:\s*["']([^']+?\.html)["']/g, function (_match, templateUrl) {
        var templatePath = path_1.join(path_1.dirname(filePath), templateUrl);
        var templateContent = loadResourceFile(templatePath);
        return "template: \"" + templateContent + "\"";
    });
}
/** Inlines the external styles of Angular components for a specified source file. */
function inlineStyles(fileContent, filePath) {
    return fileContent.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, function (_match, styleUrlsValue) {
        // The RegExp matches the array of external style files. This is a string right now and
        // can to be parsed using the `eval` method. The value looks like "['AAA.css', 'BBB.css']"
        var styleUrls = eval(styleUrlsValue);
        var styleContents = styleUrls
            .map(function (url) { return path_1.join(path_1.dirname(filePath), url); })
            .map(function (path) { return loadResourceFile(path); });
        return "styles: [\"" + styleContents.join(' ') + "\"]";
    });
}
/** Remove every mention of `moduleId: module.id` */
function removeModuleId(fileContent) {
    return fileContent.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');
}
/** Loads the specified resource file and drops line-breaks of the content. */
function loadResourceFile(filePath) {
    console.log("Inlining resource", filePath);
    return fs_1.readFileSync(filePath, 'utf-8')
        .replace(/([\n\r]\s*)+/gm, ' ')
        .replace(/"/g, '\\"');
}
inlineResourcesForDirectory("tstmp");
