import React from "react";

export default function FileComp(props) {
    return (
        <div className={['content', 'file'].join(' ')}>
            <span className="file-name">
                {props.fileData[0]}
            </span>
            <div className="file-details">
                <p>{JSON.stringify(new Date(props.fileData[1].atime))}</p>
                <p>{JSON.stringify(new Date(props.fileData[1].mtime))}</p>
                <p>{JSON.stringify(new Date(props.fileData[1].ctime))}</p>
                <p>{props.fileData[1].size}</p>
                <p>{props.fileData[1].extension}</p>
            </div>
        </div>
    );
    
}
