"use strict";
let express = require('express');
let compression = require('compression');
let app = express();
app.use(compression());
app.use('/', express.static('.'));
app.listen(3000);