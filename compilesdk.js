var fs = require('fs')

var uglifyjs = require('uglify-es')

var options = {
    // outSourceMap: "indoorunMap.min.js.map"
}

var files = {
	'libidrn.js':"./dist/libidrn.min.js",
	'indoorunMap.js':"./dist/indoorunMap.min.js"
}

var str = uglifyjs.minify(files, options)

fs.writeFile("./app/static/indoorun.min.js", str.code)

// fs.writeFile('./app/static/indoorun.min.js.map', str.map)