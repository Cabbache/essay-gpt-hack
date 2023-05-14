#!/bin/bash
browserify plain.js > browserified.js
uglifyjs --mangle -- browserified.js > core.js
uglifyjs --mangle -- extras.js > extras_.js
rm browserified.js
