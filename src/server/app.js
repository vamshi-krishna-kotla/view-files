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
import { StaticRouter } from 'react-router-dom';

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

app.get('/favicon.ico', (req, res) => {
	res.status(200).end();
});

app.use('/api', (req, res) => {
	const filePath = process.cwd() + req.url;
	
	fs.stat(filePath, (err, stats) => {
		if (err) {
			return res.status(500).send('Internal Server Error').end();
		} else {
			const isDirectory = stats.isDirectory();
			const size = getFormattedSize(stats.size);
			const name = path.basename(filePath);
			const parent = path.dirname(filePath);
			const children = isDirectory ? fs.readdirSync(filePath) : [];
			res.json({
				name,
				size,
				isDirectory,
				parent,
				filePath,
				children
			});
		}
	});
});

app.get('*', (req, res) => {
	let children = [];

	// fetch the initial HTML file
	const HTML = fs.readFileSync(path.resolve(__dirname, '../view.html'), {
		encoding: 'utf8'
	});

	fs.stat(process.cwd() + req.url, (err, stats) => {
		if (err) {
			return res.status(500).send('Internal Server Error').end();
		} else {
			if (stats.isDirectory()) {
				children = fs.readdirSync(process.cwd() + req.url);
			}

			/**
			 * send the updated HTML
			 */
			res.send(HTML
				.replace('$$children$$', JSON.stringify(children))
				// render the React components as string for SSR
				.replace('<div id="root"></div>',
					`<div id="root">
						${renderToString(
							<StaticRouter
								location={req.url}
							>
								<App route={req.url} children={children}/>
							</StaticRouter>
						)}
					</div>`)
			).end();
		}
	});
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
