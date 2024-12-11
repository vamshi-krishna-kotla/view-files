import React, { useState, useRef } from "react";

export default function FileComp(props) {
    const [displayDetails, setDisplayDetails] = useState(false);

    /**
     * @note
     * using useRef hook to tap into the file-details div so that
     * the value of its height can be used for transition to toggle
     * displaying the file details
     * 
     * ref: https://reactjs.org/docs/refs-and-the-dom.html
     */
    const detailsRef = useRef(null);

    const toggle = (event) => {
        event.stopPropagation();
        setDisplayDetails(!displayDetails);
    };

    return (
        <div className={['content', 'file'].join(' ')} onClick={toggle}>
            <div className="file-name">
                <span>{props.fileData[0]}</span>
                <span>{!displayDetails ? props.fileData[1].size : ''}</span>
            </div>
            <div className="file-details" ref={detailsRef} style={{height: displayDetails ? detailsRef.current.scrollHeight : '0'}}>
                {/* 
                    @note
                    using string literals with backticks to display time

                    new Date() by default returns an Object type date value and
                    React cannot have objects as children
                    
                    using the string literals typecasts the Object format date into string format
                    which can be rendered by React as a child
                */}
                <p>Last accessed: {`${new Date(props.fileData[1].atime)}`}</p>
                <p>Last modified: {`${new Date(props.fileData[1].mtime)}`}</p>
                <p>Size: {props.fileData[1].size}</p>
            </div>
        </div>
    );
    
}
