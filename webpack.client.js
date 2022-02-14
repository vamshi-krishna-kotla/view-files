const path = require('path');

module.exports = {
	entry: './src/client/index.js',
	mode: 'production',
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/'
	},
	target: 'web',
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
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
		]
	}
};