#Angular 2 quick start templates

Here are some basic templates for getting [Angular 2](https://angular.io) quickly up and running.
We've chosen to use [JSPM](http://jspm.io/) for configuring systemjs packages and transpiling,
which also makes it very easy to add other modules.

The example also shows how to create a single-file, minified bundle for production use.

## Setup

Go into the materials folder if you want an angular2-materials template,
or to the plain folder if you want angular2 without materials.

For development remember to run:

```
npm install
npm run jspminstall
```

for installing dependencies.

Use index_dev.html for development

## Production bundle creation

To build a production bundle (app-bundle.min.js) for running in index.html type:

```
npm run bundle
```

## Test environment

To start a simple web server for testing type:

```
npm run lite
```

This will start a webserver at http://localhost:3000

(remember to go to index_dev.html if you're developing)
