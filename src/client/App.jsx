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

	/**
	 * function to generate HTML div tree from given formatted data
	 * 
	 * @param {Array} childrenTree Array format (like returned by returnFormattedChildrenTree function)
	 * @returns HTML tree structure for given directory
	 */
	function returnChildrenTree(childrenTree) {
		return childrenTree.map(e => {
			if (e[1] && e[1].isDirectory) {
				// directory
				return <div className={['content', 'directory'].join(' ')}>
					{e[0]}
					{e[2] && e[2].length > 0 && <App tree={e[2]} />}
				</div>
			}
			return <div className={['content', 'file'].join(' ')}>
				{e[0]}
			</div>
		});
	}

	// return the HTML generated after filtering the JSON output from props
	return (
		returnChildrenTree(props.tree)
	);
}