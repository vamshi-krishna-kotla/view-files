import React, { useState, useRef } from "react";

import { returnChildrenTree } from '../../utils/index.js';

export default function DirComp(props) {
    const [displayChildren, setDisplayChildren] = useState(false);
    const dirRef = useRef(null);
    const hasChildContent = props.dirData[2] && props.dirData[2].length > 0;

    const toggle = (event) => {
        event.stopPropagation();
        setDisplayChildren(!displayChildren);
    };

    return (
        <div className={['content', 'directory', displayChildren ? 'open' : ''].join(' ')} onClick={toggle}>
            <span className="dir-name">{props.dirData[0]}</span>
            <div className="directory-children" ref={dirRef} style={{ height: displayChildren ? (hasChildContent ? 'auto' : dirRef.current.scrollHeight) : '0' }}>
                {
                    hasChildContent
                    ?
                    returnChildrenTree(props.dirData[2])
                    :
                    <span>
                        This is an empty folder or this folder's contents have been excluded from display
                    </span>
                }
            </div>
        </div>
    );
}
