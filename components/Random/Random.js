import React from 'react';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RefreshIcon from '@material-ui/icons/Refresh';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { selectPomData } from '../../utils';

import Tags from '../Tags';
import PomDrawer from '../PomDrawer';

import { playPom, toggleSavedPom } from '../../redux/firebase';
import { setPomId } from '../../redux/client';
import Link from 'next/link';

const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        width:'100%',
        padding: 20,
    },
    card: {
        display: 'flex',
        width: '100%',
        minWidth: '320px',
        maxWidth: '500px',
        justifyContent: 'space-between',
        position: 'relative',
        minHeight: '200px',
    },
    details: {
        display: 'flex',
        width: '70%',
        overflow: 'hidden',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
        minHeight: '150px',
    },
    cover: {
        width: '30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    playIcon: {
        height: 80,
        width: 80,
    },
    icon: {
        height: 15,
        width: 15,
    },
    buttons: {
        display: 'flex',
        position: 'absolute',
        left: 0,
        bottom: 0,
        alignItems: 'center',
        width: '60%',
    },
    tags: {
        display: 'flex',
        paddingLeft: 5,
    }
});

function RandomCard(props) {

    /*
     * Caches the props such that the component doesn't update
     * until the next pom is ready
     */
    const [cachedProps, setCachedProps] = React.useState(props);
    if (!props.pom && cachedProps) {
        props = cachedProps;
    } else if (!cachedProps || props.id !== cachedProps.id) {
        setCachedProps(props);
    }

    const {
        classes,
        id,
        play: _play = () => {},
        toggleSaved: _toggleSaved = () => {},
        onRandomise: _onRandomise,
        pom,
        user,
    } = props;

    const onRandomise = (e) => {
        e.stopPropagation();
        _onRandomise(e);
    }

    const play = (e) => {
        e.stopPropagation();
        _play(e);
    }

    const toggleSaved = (e) => {
        e.stopPropagation();
        _toggleSaved(e);
    }

    const {
        description = '',
        duration = 0,
        imageSrc = '',
        title = '',
        userName = '',
    } = pom ? selectPomData(pom) : {};

    const isUser = user && user.isLoaded && !user.isEmpty;
    const isSaved = user && user.saved && user.saved[id];

    return (
        <div className={classes.root}>
        <Card className={classes.card}>
            <Link href='/pom/[id]' as={`/pom/${id}`}>
                <div onClick={() => props.setPom()} className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography variant="h6">
                            {title}
                        </Typography>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <Typography color="textSecondary" style={{fontSize: '0.8rem'}}>
                                    {userName}
                            </Typography>
                            <Typography  color="textSecondary" style={{fontSize: '0.8rem', paddingLeft: 5}}>
                                    {` — ${duration} mins`}
                            </Typography>
                        </div>
                        <Typography variant="caption" component="span" style={{fontSize: '0.7rem', paddingTop: 5, paddingBottom: 10, maxWidth: 200}}color="textSecondary">
                            {description}
                        </Typography>
                        <div className={classes.buttons}>
                            <IconButton aria-label="Refresh" className={classes.refreshButton} onClick={onRandomise}>
                                <RefreshIcon className={classes.icon} />
                            </IconButton>
                            {isUser && <IconButton aria-label="Favourite" className={classes.favouriteButton} onClick={toggleSaved}>
                                {isSaved ? <FavoriteIcon className={classes.icon} /> : <FavoriteBorderIcon className={classes.icon}/>}
                            </IconButton>}
                            <div className={classes.tags}>
                                <Tags id={id}/>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Link>
            <CardMedia
                className={classes.cover}
                image={imageSrc}
                title={title}
            >
                <IconButton
                    aria-label="Play/pause"
                    onClick={play}
                >
                    <PlayArrowIcon className={classes.playIcon} />
                </IconButton>
            </CardMedia>
        </Card>
        </div>
    );
}

RandomCard.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const ConnectedRandomCard =  compose(
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
            setPom: () => setPomId(ownProps.id),
        }, dispatch)
    ),
)(RandomCard);

export default withStyles(styles, { withTheme: true })(ConnectedRandomCard);