import React from 'react';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import Timestamp from 'react-timestamp';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import IconButton  from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { playPom, toggleSavedPom } from '../redux/firebase';


import { selectPomData } from '../utils';
import TrackList from './TrackList';
import Tags from './Tags';

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
        minHeight: '100vh',
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
    favouriteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    inline: {
        display: 'inline',
    },
});

function PomDrawer({
    id,
    pom = {},
    dispatch: _1,
    children,
    user,
    toggleSaved = () => {},
    play = () => {},
    ...props
}) {

    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (open) => event => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
        }
        setOpen(open);
    };

    const {
        title = '',
        userName = '',
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

    return (
        <>
        <div onClick={toggleDrawer(true)} {...props}>
            {children}
        </div>
        {/* <Button onClick={toggleDrawer(true)}>More</Button> */}
        <Drawer anchor="bottom" open={open} onClose={toggleDrawer(false)}>
            <div className={classes.drawer}>
                <IconButton className={classes.collapseButton} onClick={toggleDrawer(false)}>
                    <ExpandMoreIcon />
                </IconButton>
                {showSaved ? <IconButton className={classes.favouriteButton} aria-label="Favourite" onClick={toggleSaved}>
                    {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton> : null}
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
                        <Typography component="span" variant="subtitle1" className={classes.inline} color="textPrimary" style={{fontSize: '0.75em',}}>
                            {userName}
                        </Typography>
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
            </div>
        </Drawer>
        </>
    );
}

const ConnectedPomDrawer =  compose(
    firebaseConnect(props => ([
        `pom/${props.id}`,
    ])),
    connect(
        (state, _props) => ({
            pom: _props.id && state.firebase.data.pom && state.firebase.data.pom[_props.id],
            user: state.firebase.profile,
        }),
        (dispatch, ownProps) => bindActionCreators({
            toggleSaved: () => toggleSavedPom(ownProps.id),
            play: () => playPom(ownProps.id),
        }, dispatch)
    ),
)(PomDrawer);

export default ConnectedPomDrawer;