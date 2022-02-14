const path = require('path');

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
	}
}