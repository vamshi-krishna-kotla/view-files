/**
 * central React component to render the app
 */
import React, { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import './App.scss';

/**
 * React component that takes in props and renders the HTML tree
 * @param {Object} props prop values sent from the server (that are also taken from window.folderTree)
 * @returns no return value
 */
export default function App(props) {
	// flag to check if children are available for current path
	const areChildrenAvailable = (props.children && props.children.length);

	// initiatialize "children" state variable for rendering the children of the current directory
	let [children, setChildren] = useState(areChildrenAvailable ? props.children : []);
	// initiatialize "fileAttrs" state variable for rendering the file details of a file
	let [fileAttrs, setFileAttrs] = useState({});

	// fetch the children of the current directory if not available
	useEffect(() => {
		if (!areChildrenAvailable) {
			fetch(`/api${props.route}`)
				.then(res => res.json())
				.then(data => {
					setChildren(data.children);
					delete data.children;
					setFileAttrs(data);
				})
				.catch(err => {
					setChildren([]);
					console.error(err);
				});
		}
	}, []);

	/**
	 * function to get the formatted date-time string from milliseconds
	 * @param {Number} milliseconds time in milliseconds
	 */
	function getDateTimeString(milliseconds) {
		if (milliseconds && typeof milliseconds === 'number') {
			const newDate = new Date(milliseconds);
			return `${newDate.toDateString()} ${newDate.toLocaleTimeString()}`;
		}

		return '';
	}

	return (
		<>
		<div className='content'>
			{
				// render the content for received children data
				children.map((child, index) => {
					return (
						<div key={'child_' + index} className="child">
							{/* generate dynamic routes for each child */}
							<Link to={`${props.route}${child}/`}>{child}</Link>
						</div>
					);
				})
			}
			{
				// render the file details if children are not available and target is a file (not directory)
				!children.length && !fileAttrs.isDirectory && (
					<div className="file-details">
						<h3>{fileAttrs.name}</h3>
						<p><strong>Size: </strong>{fileAttrs.size}</p>
						<p><strong>Path: </strong>{(fileAttrs?.filePath || '').replace(/\\/g, '/')}</p>
						<p><strong>Created: </strong>{getDateTimeString(fileAttrs.birthTime)}</p>
						<p><strong>Modified: </strong>{getDateTimeString(fileAttrs.modifiedTime)}</p>
						<p><strong>Last Accessed: </strong>{getDateTimeString(fileAttrs.lastAccessed)}</p>
					</div>
				)
			}
		</div>
		<Switch>
			{
				// generate dynamic routes renderer for each child route
				children.map((child, index) => {
					return (
						<Route path={`${props.route}${child}/`} key={'route_' + index}>
							<App route={`${props.route}${child}/`} children={[]} />
						</Route>
					);
				})
			}
		</Switch>
		</>
	);
}
