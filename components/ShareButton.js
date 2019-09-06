import React from 'react';
import { IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

import {
    isMobile,
    isChrome,
    isSafari,
    isMobileSafari,
    isOpera,
} from "react-device-detect";

function ShareButton({title="", name=""}) {

    const isCompatible = (isMobile && (isSafari || isChrome || isOpera)) || isMobileSafari;
    const canShare = isCompatible && global.window && navigator.share;

    let text = `Check out ${title} by ${name} on Tomatify`;
    if (name && !title) text = `Check out ${name} on Tomatify`;
    if (!name && !title) text = 'Check out Tomatify';

    const data = {
        text,
        url: global.window && window.location.href,
    };

    const onClick = () => {
        if (canShare) navigator.share(data)
        .then(() => console.log('shared', data))
        .catch((err) => console.log(err))
    }

    return canShare ? <IconButton aria-label="Share" onClick={onClick}>
        <SendIcon />
    </IconButton> : null;
}

export default ShareButton;