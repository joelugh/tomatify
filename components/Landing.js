import React from 'react';
import Hero from './Hero';
import { Button } from '@material-ui/core';

import {
    isMobile,
} from "react-device-detect";

function Landing(props) {
    return <>
        <Hero more={!isMobile} />
        <Button
            size="large"
            color="primary"
            variant="contained"
            onClick={props.goToHome}
            style={{margin: 20}}
        >Enter Tomatify</Button>
    </>
}

export default Landing;