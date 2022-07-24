/**
 * main file for front-end
 */

// required imports
import React from 'react';
import { hydrate } from 'react-dom';

import { returnFormattedChildrenTree } from './utils/index.js';

import App from './App.jsx';

// get target div
const root = document.querySelector('#root');

// get the main child nodes of target directory
let children = ((window.folderTree || {}) || {}).__child_nodes__ || {};

// hydrate the app as the app is server-side rendered
hydrate(<App tree={ returnFormattedChildrenTree(children) }/>, root);
