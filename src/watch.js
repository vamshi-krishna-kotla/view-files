/**
 * watcher file to update the build file generation for both client and server
 * 
 * helps during development by taking off the requirement to
 * run build everytime when there is change made
 */

const webpack = require('webpack');

// read the respective webpack configs
const clientConfig = require('../webpack.client');
const serverConfig = require('../webpack.server');

// create respective webpack compilers
const clientCompiler = webpack(clientConfig);
const serverCompiler = webpack(serverConfig);

// start the client watcher
clientCompiler.watch({
	aggregateTimeout: 500,
	ignored: /node_modules/
}, (err, stats) => {
	if (err) {
		console.log(err);
	}
	else {
		console.log('watcher running');
		console.log(stats.toString({
			colors: true
		}));
	}
});

// start the server watcher
serverCompiler.watch({
	aggregateTimeout: 500,
	ignored: /node_modules/
}, (err, stats) => {
	if (err) {
		console.log(err);
	}
	else {
		console.log('watcher running');
		console.log(stats.toString({
			colors: true
		}));
	}
});
