/**
 * central React component to render the app
 */

import { returnChildrenTree } from './utils/index.js';

import './App.scss';

/**
 * React component that takes in props and renders the HTML tree
 * @param {Object} props prop values sent from the server (that are also taken from window.folderTree)
 * @returns no return value
 */
export default function App(props) {

	// return the HTML generated after filtering the JSON output from props
	return (
		returnChildrenTree(props.tree)
	);
}