/**
 * main file for front-end
 */

// required imports
import React from 'react';
import { hydrate } from 'react-dom';

import App from './App.jsx';

// get target div
const root = document.querySelector('#root');

// hydrate the app as the app is server-side rendered
hydrate(<App tree={window.folderTree}/>, root);
