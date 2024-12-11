# view-files

## Description
An npm package to display the details of contents of a directory on the browser

NPM Registry: https://www.npmjs.com/package/view-files
GitHub: https://github.com/vamshi-krishna-kotla/view-files

## Usage:
1. Install the package `npm i view-files`
    * suggested to install as a global dependency (`-g`) to be used with any directory
2. Run the command `view-files` in the target directory from the terminal
    * if the command does not work directly, use `npx view-files`
3. After the notification on the terminal, open http://localhost:3000 to view details

Or

1. Directly call `npx view-files` to dynamically install the binary and execute

## Key features:
1. Displays the list of all contents of the directory
2. Child directories can be accessed to see internal content
3. Child files display the data
    - size
    - last accessed time
    - last modified time

## KPIs:
1. Custom [Webpack](https://webpack.js.org/) configuration for server and client
2. [ExpressJS](https://expressjs.com/) for server and [React](https://react.dev/) for GUI with [SASS](https://sass-lang.com/) support