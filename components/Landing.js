import React from 'react';
import Hero from './Hero';
import { Button, makeStyles, Typography, Link } from '@material-ui/core';

import {
    isMobile,
} from "react-device-detect";

const useStyles = makeStyles({
    root: {
        margin: 10,
        fontFamily: "Circular,Helvetica,Arial,sans-serif",
        backgroundColor: "#1db954",
        color: 'white',
        fontWeight: 700,
        borderRadius: 500,
        padding: "18px 48px 16px",
        transitionProperty: "background-color,border-color,color,box-shadow,filter",
        transitionDuration: ".3s",
        borderWidth: 0,
        letterSpacing: 2,
        minWidth: 160,
        textTransform: 'uppercase',
        whiteSpace: 'normal',
        "&:hover": {
            background: "#24e368",
        },
        "&:active": {
            background: "#1aa34a",
        }
    }
})

function Landing(props) {
    const classes = useStyles()
    return <>
        <Hero more={!isMobile} />
        <button
            className={classes.root}
            onClick={() => window.open('popup.html', 'name', 'height=585,width=400')}
            >Login With Spotify</button>
        <Typography variant="caption">Note: <Link href="https://www.spotify.com/premium/">Spotify Premium</Link> is required.</Typography>
    </>
}

export default Landing;