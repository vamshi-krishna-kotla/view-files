/**
 * server code that reads the folder structure from current
 * working directory and responds with a server-side rendered
 * representation of the structure
 */

// required imports
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { default as App } from '../client/App.jsx';

import fs from 'fs';
import path from 'path';
import { returnFormattedChildrenTree } from '../utils';

// init the server
const app = express();

// middleware to support JSON format
app.use(express.json());

/**
 * middleware to serve the front-end static scripts
 * 
 * @note the server code will be bundled and put in the /dist folder
 * where the static assets are stored too, hence we are statically
 * serving the same directory with __dirname
 */
app.use(express.static(path.resolve(__dirname)));

// PORT to be used for the app
const PORT = process.env.PORT || 3000;

// the current directory is the target
let dir = process.cwd();

// initialize the object that carries the end output
let tree = {
	path: dir.replace(/\\/g, '/'),
};

/**
 * function to format the size of the file
 * @param {Number} size numeric value of size of any file 
 * @returns {String} formatted size with appropriate units
 */
const getFormattedSize = (size) => {
	let i = 0;
	const byteUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	while (size > 1024) {
		size /= 1024;
		i++;
	}

	return `${Math.max(size, 0.1).toFixed(1)} ${byteUnits[i]}`;
}

/**
 * 
 * @param {String} path path to the directory or file
 * @param {String} key '|' separated keys to access the tree object at required depths
 * @returns no return value as this function is used to set the "tree" object
 */
const getContents = (path, key) => {
	// get the stats for the file or directory
	const stats = fs.statSync(path);

	// variable to check if content is a file or directory
	let isDirectory = stats.isDirectory();

	// set the relative path
	let relPath = path.slice(dir.length, path.length);

	// initialize required placeholders
	let contentsObject = {};
	let contentsArray = [];
	let fileContentConfig = {};
	let dirChildrenConfig = {};

	/**
	 * @note we are not exploring the 'node_modules' and '.git' folders
	 * 
	 * return if these directories are sent to fetch contents from
	 */
	if ((isDirectory) &&
		(path.indexOf('node_modules') > -1 ||
			path.indexOf('.git') > -1)
	) return;

	// if the content is a file
	if (!isDirectory) {
		/**
		 * retrieve following stats for the file
		 * size
		 * accessTime
		 * modifyTime
		 * changeTime
		 */
		let { size, atime, mtime, ctime } = stats;

		// set the file stats
		fileContentConfig = {
			size: getFormattedSize(size), // size is returned in bytes ref: https://nodejs.org/api/fs.html#statssize
			atime,
			mtime,
			ctime,
			extension: path.slice(path.lastIndexOf('.') + 1, path.length)
		};
	}

	// if the content is a directory
	else {
		// read the contents of the directory
		contentsArray = fs.readdirSync(path, {});

		// set the contents in Object format and default to null
		contentsArray.forEach(content => {
			contentsObject[content] = null;
		});

		// set the '__child_nodes__' key in the directory object
		dirChildrenConfig = { __child_nodes__: contentsObject };
	}

	/**
	 * store the tree object in a placeholder
	 * so that we can access the depths
	 */
	let dest = tree;

	// split the depth string into array
	let depth = key.split("|"), len = depth.length - 1;
	for (let i = 0; i < len; i++) {
		/**
		 * if there is a '__child_nodes__' element available then enter it
		 * 
		 * we are setting the '__child_nodes__' element
		 * for directory object, hence we need to enter into this key
		 * to set the further contents properly in the hierarchy
		 * 
		 * @note folders with the name __child_nodes__ will be skipped
		 * due to this
		 */
		dest = dest[depth[i]]['__child_nodes__'] ? dest[depth[i]]['__child_nodes__'] : dest[depth[i]];
	}

	// set the value at the given depth in the tree object with appropriate configurations
	dest[depth[len]] = Object.assign({ isDirectory, relPath }, fileContentConfig, dirChildrenConfig);

	/**
	 * recursively call the function to fetch and set the contents
	 * as we go deep into the folder structure
	 */
	contentsArray.forEach(content => getContents(path + '/' + content, `${key}|${content}`));
}

// call the function
getContents(dir, 'content');

/**
 * function to return the required data from the "tree" based on the
 * child path (taken from the URL)
 * 
 * this function digs into the tree structure and retrives the
 * corresponding data of the nested children at any possible depth
 * 
 * @param {*} path : path (or route) sent from the URL
 * @returns tree structure retrieved from the "tree" object
 */
const filterTree = (path) => {
	// set the initial tree structure
	let data = tree.content.__child_nodes__, i;

	// split the path based on '/' to form the depthArray
	const pathDepthArray = path.split('/');

	/**
	 * dig into the tree
	 * loop to the penultimate element and enter into the __child_nodes__ at each level
	 * retrive the data at the last level without entering __child_nodes__ at the end
	 * 
	 * e.g. parent/child/grand-child
	 * depthArray -> ['parent', 'child', 'grand-child']
	 * need data at tree -> parent -> child -> grand-child
	 * 
	 * access data.parent.__child_nodes__.child.__child_nodes__.grand-child
	 */
	for(i = 0; i < pathDepthArray.length - 1; i++) {
		data = data[pathDepthArray[i]].__child_nodes__;
	}
	data = data[pathDepthArray[i]];

	return data;
}

/**
 * function to remove the '/' at the end of the path for routing
 * 
 * @param {String} url : path that may or may not have '/' at the end
 * @returns trimmed path after removing '/' at the end
 */
const parseUrl = (url) => {
	let length = url.length;
	return (url.charAt(length - 1) === '/') ? url.slice(0, length - 1) : url;
}

// configure GET request to serve the UI for any path params
app.get('/*', (req, res) => {
	try {
		// fetch the initial HTML file
		const HTML = fs.readFileSync(path.resolve(__dirname, '../view.html'), {
			encoding: 'utf8'
		});

		// get the route from the path
		const requestedDir = parseUrl(req.params[0]);

		// get the data to be sent to the component based on the route
		const treeToSend = requestedDir ? filterTree(requestedDir) : tree.content;

		/**
		 * send the updated HTML
		 */
		res.send(HTML
			// set the global variables for ui reference
			.replace('$$FOLDER_TREE$$', JSON.stringify(treeToSend || {}))
			.replace('$$MAIN_DIR_PATH$$', `'${tree.path}'`)
			// render the React components as string for SSR
			.replace('<div id="root"></div>',
				`<div id="root">${renderToString(<App tree={returnFormattedChildrenTree((treeToSend || {}).__child_nodes__)}/>)}</div>`)
		);
	} catch (error) {
		// log the error and respond with 500 for internal issue
		console.error(error);
		res.status(500).send(error);
	}
	finally {
		// end the response
		res.end();
	}
});

// instantiate and start the server
let server = app.listen(PORT, () => {
	console.log(`Check your folder on http://localhost:${PORT}`);
});

// close the server and exit when the process is terminated
process.on('SIGINT', () => {
	server.close();
	process.exit(1);
});
