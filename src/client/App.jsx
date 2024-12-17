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
	// initiate "children" state variable for rendering the children of the current directory
	let [children, setChildren] = useState([]);

	// fetch the children of the current directory if not available
	useEffect(() => {
		if (props.children && props.children.length) {
			setChildren(props.children);
		} else {
			fetch(`/api${props.route}`)
				.then(res => res.json())
				.then(data => {
					setChildren(data.children);
				})
				.catch(err => {
					setChildren([]);
					console.error(err);
				});
		}
	}, []);

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
