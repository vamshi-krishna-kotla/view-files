import React from "react";

import './App.scss';

export default function App(props) {
	let children = (((props.tree || {}).content) || {}).__child_nodes__ || {};

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

	return (
		<div id="app">
			{
				returnChildrenTree(returnFormattedChildrenTree(children))
			}
		</div>
	);
}