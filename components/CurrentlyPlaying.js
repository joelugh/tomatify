import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { bottomNavHeight } from './BottomNav';
import { useCurrentlyPlaying, selectPomData, useInterval } from '../utils';
import { Typography, Link as MuiLink, IconButton } from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { useFirebaseConnect } from 'react-redux-firebase';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import Cover from './Cover';
import { play, pause } from '../redux/firebase';

const useStyles = makeStyles({
    container: {
        boxShadow: '0px 1px 2px grey',
        backgroundColor: '#fcfcfc',
        position: 'fixed',
        bottom: bottomNavHeight,
        width: '100%',
        display:'flex',
        justifyContent: 'center',
        zIndex: 1,
    },
    root: {
        height: 80,
        width: '100%',
        // minWidth: 320,
        // maxWidth: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    details: {
        paddingLeft: 15,
        display: 'flex',
        alignItems: 'center',
        maxWidth: "calc(100vw - 120px - 20px)",
        // overflow: 'hidden',
        whiteSpace:'nowrap',
        textOverflow: 'ellipsis',
    },
    text: {
        width: "calc(100vw - 120px - 90px - 20px)",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 15,
    },
    controls: {
        padding: 15,
        width: 120,
        minWidth: 120,
        display:'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexGrow: 1,
        flexShrink: 1,
    },
    time: {
        paddingRight: 10,
        display:'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

function Timer({ms, now}) {
    let val = ms;
    if (now) val = ms - (Date.now() - now);
    if (val < 10000) val = 0;
    const [mins, setMins] = React.useState(Math.ceil((val)/60/1000));
    useInterval(() => {
        let val = ms;
        if (now) val = ms - (Date.now() - now);
        if (val < 10000) val = 0;
        setMins(Math.ceil((val)/60/1000));

    }, 1000)
    const minsColor = mins <= 5 ? 'secondary' : 'inherit';
    return <Typography variant="h6" color={minsColor}>{`${mins} m`}</Typography>
}


function CurrentlyPlaying({pomId, activeTrack, progressMs, progressNow, paused}){
    const classes = useStyles();
    const dispatch = useDispatch();
    useFirebaseConnect(`/pom/${pomId}`);
    const rawPom = useSelector(state => state.firebase.data && state.firebase.data.pom && state.firebase.data.pom[pomId]);
    const pom = selectPomData(rawPom || {});
    const track = pom.tracks.reduce((acc,track) => (track.uri === activeTrack) ? acc = track : acc, null);
    return (
        <div className={classes.container}>
            <div className={classes.root}>
                <div className={classes.details}>
                    <Cover id={pomId} />
                    <div className={classes.text}>
                        <Link href="/pom/[id]" as={`/pom/${pomId}`}><Typography variant="subtitle1" noWrap><MuiLink color="inherit">{pom.title}</MuiLink></Typography></Link>
                        <Typography variant="subtitle2" noWrap>{track && track.title}</Typography>
                    </div>
                </div>
                <div className={classes.controls}>
                    <div className={classes.time}>
                        {track && <Timer ms={track.remaining_ms-progressMs} now={progressNow}/>}
                    </div>
                    <IconButton
                        variant="outlined"
                        onClick={() => {
                            if (paused) dispatch(play());
                            else dispatch(pause());
                        }}
                    >
                        {paused ? <PlayIcon/> : <PauseIcon/>}
                    </IconButton>
                </div>
            </div>
        </div>
    );
}

export default function CurrentlyPlayingWrapper(props){
    const now = useInterval();
    const classes = useStyles();
    const currentlyPlaying = useCurrentlyPlaying();
    if (!currentlyPlaying || !currentlyPlaying.pom) return null;
    return <CurrentlyPlaying
        pomId={currentlyPlaying.pom}
        activeTrack={currentlyPlaying.track}
        progressMs={currentlyPlaying.progress}
        progressNow={currentlyPlaying.now}
        paused={currentlyPlaying.paused}
    />
}