const path = require('path');
const { BannerPlugin } = require('webpack');

module.exports = {
	entry: './src/server/app.js',
	mode: 'production',
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/',
		filename: 'server.js'
	},
	target: 'node',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
					}
				]
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: 'ignore-loader'
			},
		]
	},
	plugins: [
		// use the banner plugin to add a shebang to the build file so that it can be triggered from CLI
		new BannerPlugin({banner: '#!/usr/bin/env node', raw: true})
	]
}