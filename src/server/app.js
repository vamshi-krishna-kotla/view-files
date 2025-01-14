/**
 * server code that reads the folder structure from current
 * working directory and responds with a server-side rendered
 * representation of the structure
 */

// required imports
import express from 'express';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import { default as App } from '../client/App.jsx';

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
 * middleware to serve the API response for "/api" route
 * responds to all requests with "/api" prefix in the URL
 * used to generate the required info for a specific path from the target directory
 */
app.use('/api', (req, res) => {
	const filePath = process.cwd() + req.url;

	try {
		const stats = fs.statSync(filePath);
		const isDirectory = stats.isDirectory();

		res.status(200).json({
			isDirectory,
			name: path.basename(filePath),
			parent: path.dirname(filePath),
			children: isDirectory ? fs.readdirSync(filePath) : [],
			size: getFormattedSize(stats.size),
			filePath,
			birthTime: stats.birthtimeMs,
			modifiedTime: stats.mtimeMs,
			lastAccessed: stats.atimeMs,
		}).end();
	} catch (error) {
		console.error(error);
		res.status(500).send({ error, message: 'Internal Server Error', success: false }).end();
	}
});

/**
 * route to serve the SSR content for any requested path
 * renders the HTML with React app for requested path from target directory
 */
app.get('*', (req, res) => {
	try {
		let children = [], SSR_HTML = '';

		// fetch the initial HTML file
		const HTML = fs.readFileSync(path.resolve(__dirname, '../view.html'), {
			encoding: 'utf8'
		});

		const stats = fs.statSync(process.cwd() + req.url);
		if (stats.isDirectory()) {
			children = fs.readdirSync(process.cwd() + req.url);
		}

		// render the React components as string for SSR
		SSR_HTML = HTML
					.replace('$$children$$', JSON.stringify(children))
					.replace('$$target_dir$$', process.cwd().replace(/\\/g, '/'))
					.replace('<div id="root"></div>',
						`<div id="root">
							${renderToString(
								<StaticRouter location={req.url}>
									<App route={req.url} children={children}/>
								</StaticRouter>
							)}
						</div>`);

		res.status(200).contentType('text/html').send(SSR_HTML).end();
	} catch (error) {
		console.error(error);
		res.status(500).send({ error, message: 'Internal Server Error', success: false }).end();
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
