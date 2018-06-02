const path = require('path')
const webpack = require('webpack')

function resolve (dir) {
	
	return path.join(__dirname, dir)
}

module.exports = {
	entry: {
		indoorunMap:'./map.js',
	},
	// devtool: "cheap-module-eval_source-map",
	output: {
		filename: "[name].min.js",
		path: path.resolve(__dirname, './dist/'),
		library: '[name]',
		libraryTarget: 'window',
		sourceMapFilename: "[name].min.js.map"
	},
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': resolve('indoorunMap')
		}
	},
	module:{
		rules: [
			{
				test: /\.js$/,
				include: [resolve('.'), ],
				use:{
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			}
		]
	},
	plugins: [
		// http://vuejs.github.io/vue-loader/en/workflow/production.html
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			sourceMap: true
		}),
		// split vendor js into its own file
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: function (module, count) {
				// any required modules inside node_modules are extracted to vendor
				return (
					module.resource &&
					/\.js$/.test(module.resource) &&
					module.resource.indexOf(
						path.join(__dirname, '../node_modules')
					) === 0
				)
			}
		}),
		// extract webpack runtime and module manifest to its own file in order to
		// prevent vendor hash from being updated whenever app bundle is updated
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest',
			chunks: ['vendor']
		}),
	]
}