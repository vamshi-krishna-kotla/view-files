/**
 * central React component to render the app
 */

import React from "react";

import './App.scss';

/**
 * React component that takes in props and renders the HTML tree
 * @param {Object} props prop values sent from the server (that are also taken from window.folderTree)
 * @returns no return value
 */
export default function App(props) {
	// get the main child nodes of target directory
	let children = (((props.tree || {}).content) || {}).__child_nodes__ || {};

	/**
	 * function to format the JSON output coming from props (server)
	 * the formatted data holds Array, of the name, child content and
	 * Array of next directory in the depth
	 * 
	 * 
	 * @param {Object} parent JSON tree of specific directory
	 * @returns {Array} an array of the child nodes in the following format
	 * [
	 * 	<directory-name/filename>,
	 * 	<JSON for child nodes of current directory/null>,
	 * 	<Array format of data of child nodes>
	 * ]
	 * 
	 */
	function returnFormattedChildrenTree(parent) {
		let childrenNodes = [];
		for (let child in parent) {
			if (Object.hasOwnProperty.call(parent, child)) {
				const element = parent[child];
				childrenNodes.push([child, element]);
			}
		}
		childrenNodes = childrenNodes.map(e => {
			if (e[1] && e[1].isDirectory) {
				e.push(returnFormattedChildrenTree(e[1].__child_nodes__));
			}
			else {
				e.push(null);
			}
			return e;
		});
		return childrenNodes;
	}

	/**
	 * function to generate HTML div tree from given formatted data
	 * 
	 * @param {Array} childrenTree Array format (like returned by returnFormattedChildrenTree function)
	 * @returns HTML tree structure for given directory
	 */
	function returnChildrenTree(childrenTree) {
		return childrenTree.map(e => {
			return <div className={
				['content', e[1] && e[1].isDirectory ? 'directory' : 'file']
				.join(' ')}
			>
				{e[0]}
				{e[2] && e[2].length > 0 && returnChildrenTree(e[2])}
			</div>
		});
	}

	// return the HTML generated after filtering the JSON output from props
	return (
		<div id="app">
			{
				returnChildrenTree(returnFormattedChildrenTree(children))
			}
		</div>
	);
}