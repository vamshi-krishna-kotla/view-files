/**
 * main file for front-end
 */

// required imports
import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';

// get target div
const root = document.querySelector('#root');

// get the main child nodes of target directory
let children = window.__children__ || [];

// hydrate the app as the app is server-side rendered
hydrate(
    <BrowserRouter>
        <App route={window.location.pathname} children={children}/>
    </BrowserRouter>,
    root
);
