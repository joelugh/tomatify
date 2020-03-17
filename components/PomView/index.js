import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';
import Router from 'next/router';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import IconButton  from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { playPom, toggleSavedPom } from '../../redux/firebase';

import { selectPomData } from '../../utils';
import TrackList from '../TrackList';
import Tags from '../Tags';
import Link from 'next/link';
import ShareButton from '../ShareButton';

// This resolves to nothing and doesn't affect browser history
const dudUrl = 'javascript:;';

const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    drawer: {
        // minHeight: '95vh', /* goes weird when content overflow */
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    drawCard: {
        minHeight: '90vh',
        width: 400,
        padding: 20,
        paddingTop: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    description: {
        paddingBottom: 15,
    },
    cover: {
        objectFit: 'cover',
        width: 100,
        height: 100,
    },
    playButton: {
        backgroundColor: 'rgba(0,0,0,.05)',
        width: 100,
        height: 100,
        marginTop: -100,
    },
    details: {
        backgroundColor: 'rgba(0,0,0,.03)',
        borderRadius: '0px 0px 2px 2px',
        display: 'flex',
        flexDirection: 'column',
    },
    collapseButton: {
        position: 'absolute',
        top: 5,
        left: 5,
    },
    buttons: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    inline: {
        display: 'inline',
    },
    name: {
        textDecoration: 'underline',
    }
});

function PomView({
    id,
}) {

    useFirebaseConnect([
        `pom/${id}`,
    ]);

    const classes = useStyles();
    const dispatch = useDispatch();

    const pom = useSelector(state => id && state.firebase.data.pom && state.firebase.data.pom[id]);
    const user = useSelector(state => state.firebase.profile);

    const toggleSaved = () => dispatch(toggleSavedPom(id));
    const play = () => dispatch(playPom(id));

    const {
        title = '',
        userName = '',
        userId = '',
        description = '',
        duration = 0,
        imageSrc = '',
        lastModified = '',
        tracks = [],
    } = pom ? selectPomData(pom) : {};

    // const date = new Date(0); // The 0 sets the date to the epoch
    // date.setUTCSeconds(lastModified/1000);

    const showSaved = user && user.isLoaded && !user.isEmpty;
    const isSaved = user && user.saved && user.saved[id];

    return <div className={classes.drawer}>
        <IconButton className={classes.collapseButton} onClick={() => Router.back()}>
            <KeyboardBackspaceIcon/>
        </IconButton>
        <div className={classes.buttons}>
            <ShareButton title={title} name={userName} />
            {showSaved ? <IconButton aria-label="Favourite" onClick={toggleSaved}>
                {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton> : null}
        </div>
        <div className={classes.drawCard}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 20,
                }}
            >
                <img src={imageSrc} className={classes.cover} />
                <IconButton aria-label="play" className={classes.playButton} onClick={play} >
                    <PlayArrowIcon />
                </IconButton>
                <Typography variant="h5" style={{paddingTop: 10, textAlign: 'center'}}>
                    {title}
                </Typography>
                <Typography component="span" variant="h6" className={classes.inline} color="textPrimary">
                    {`${duration} mins`}
                </Typography>
                <Link href="/user/[id]" as={`/user/${userId}`}>
                    <Typography color="textPrimary">
                        <MuiLink href={dudUrl} color="inherit">
                            {userName}
                        </MuiLink>
                    </Typography>
                </Link>
                {/* <Typography component="span" variant="subtitle1" className={classes.inline} color="textSecondary" style={{fontSize: '0.7em',}}>
                    <Timestamp relative date={date} />
                </Typography> */}
                <div style={{padding: 5}}>
                    <Tags id={id} />
                </div>
            </div>
            {description && <div className={classes.description}>
                <Typography variant="caption">
                    {description}
                </Typography>
            </div>}
            <TrackList tracks={tracks} />
            <Button style={{marginTop: 15}} onClick={play}>Play Now</Button>
        </div>
    </div>;
}

export default PomView;
