import React from "react";

import { returnChildrenTree } from '../utils/index.js';

export default function DirComp(props) {
    return (
        <div className={['content', 'directory'].join(' ')}>
            {props.dirData[0]}
            {props.dirData[2] && props.dirData[2].length > 0 && returnChildrenTree(props.dirData[2])}
        </div>
    );
}
