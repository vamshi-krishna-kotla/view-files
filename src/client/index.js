import React from 'react';

import { hydrate } from 'react-dom';

import App from './App.jsx';

let root = document.querySelector('#root');

hydrate(<App tree={window.folderTree}/>, root);
