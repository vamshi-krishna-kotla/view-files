import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { default as App } from '../client/App.jsx';

import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname)));

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
 * @returns 
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

app.get('/', (req, res) => {
	try {
		const HTML = fs.readFileSync(path.resolve(__dirname, '../src/server', './view.html'), {
			encoding: 'utf8'
		});

		res.send(HTML
			.replace('$$FOLDER_TREE$$', JSON.stringify(tree))
			.replace('<div id="root"></div>',
				`<div id="root">${renderToString(<App tree={tree}/>)}</div>`)
		);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
	finally {
		res.end();
	}
});

let server = app.listen(PORT, () => {
	console.log(`Check your folder on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
	server.close();
	process.exit(1);
});
