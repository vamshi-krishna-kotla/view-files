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
 * 
 * @param {String} path path to the directory or file
 * @param {String} key '|' separated keys to access the tree object at required depths
 * @returns no return value as this function is used to set the "tree" object
 */
function getContents(path, key) {
	// variable to check if content is a file or directory
	let isDirectory = fs.lstatSync(path).isDirectory();

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
		let { size, atime, mtime, ctime } = fs.statSync(path);

		// set the file stats
		fileContentConfig = {
			size,
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

// configure GET request to serve the UI
app.get('/', (req, res) => {
	try {
		// fetch the initial HTML file
		const HTML = fs.readFileSync(path.resolve(__dirname, '../src/server', './view.html'), {
			encoding: 'utf8'
		});

		/**
		 * send the updated HTML
		 */
		res.send(HTML
			// set the global variable for ui reference
			.replace('$$FOLDER_TREE$$', JSON.stringify(tree))
			// render the React components as string for SSR
			.replace('<div id="root"></div>',
				`<div id="root">${renderToString(<App tree={tree}/>)}</div>`)
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
