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
	let [children, setChildren] = useState([]);

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
	// return the HTML generated after filtering the JSON output from props
	return (
		<>
		<div className='content'>
			{
				children.map((child, index) => {
					return (
						<div key={'child_' + index} className="child">
							<Link to={`${props.route}${child}/`}>{child}</Link>
						</div>
					);
				})
			}
		</div>
		<Switch>
			{
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