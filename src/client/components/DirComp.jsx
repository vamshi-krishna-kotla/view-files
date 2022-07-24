import React from "react";

import { returnChildrenTree } from '../../utils/index.js';

export default function DirComp(props) {
    return (
        <div className={['content', 'directory'].join(' ')}>
            <span className="title">{props.dirData[0]}</span>
            <div>
                {
                    props.dirData[2] && props.dirData[2].length > 0
                    ?
                    returnChildrenTree(props.dirData[2])
                    :
                    <span>
                        No content available in this folder or this folder's contents have been excluded from display
                    </span>
                }
            </div>
        </div>
    );
}
