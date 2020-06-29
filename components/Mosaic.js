import React from 'react';

export default function Mosaic({srcs, size=60}) {
    if (!srcs || !srcs.length) return null;
    if (srcs.length == 1) {
        // return first;
        return <img src={srcs[0]} height={size} width={size}/>;
    } else if (srcs.length == 2) {
        // do a cross
        return <div style={{
            display:'flex',
            flexWrap: 'wrap',
            width: size,
            height: size,
        }}>
            <img src={srcs[0]} height={size/2} width={size/2} />
            <img src={srcs[1]} height={size/2} width={size/2} />
            <img src={srcs[1]} height={size/2} width={size/2} />
            <img src={srcs[0]} height={size/2} width={size/2} />
        </div>
    } else if (srcs.length == 3) {
        // repeat first
        return <div style={{
            display:'flex',
            flexWrap: 'wrap',
            width: size,
            height: size,
        }}>
            <img src={srcs[0]} height={size/2} width={size/2} />
            <img src={srcs[1]} height={size/2} width={size/2} />
            <img src={srcs[2]} height={size/2} width={size/2} />
            <img src={srcs[0]} height={size/2} width={size/2} />
        </div>
    } else {
        return <div style={{
            display:'flex',
            flexWrap: 'wrap',
            width: size,
            height: size,
        }}>
            <img src={srcs[0]} height={size/2} width={size/2} />
            <img src={srcs[1]} height={size/2} width={size/2} />
            <img src={srcs[2]} height={size/2} width={size/2} />
            <img src={srcs[3]} height={size/2} width={size/2} />
        </div>
    }
}