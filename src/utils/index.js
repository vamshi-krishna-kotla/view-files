import React from "react";
import DirComp from "../client/components/DirComp.jsx";
import FileComp from "../client/components/FileComp.jsx";

/**
 * function to generate HTML div tree from given formatted data
 * 
 * @param {Array} childrenTree Array format (like returned by returnFormattedChildrenTree function)
 * @returns HTML tree structure for given directory
 */
export function returnChildrenTree(childrenTree) {
    return childrenTree.map(e => {
        if ((e[1] && e[1].isDirectory) || (['.git', 'node_modules'].includes(e[0]))) {
            // directory
            return <DirComp dirData={e}/>
        }
        return <FileComp fileData={e} />
    });
}

/**
 * function to format the JSON output coming from server
 * 
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
export function returnFormattedChildrenTree(parent) {
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
