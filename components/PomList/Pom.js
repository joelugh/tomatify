import React from 'react';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import Timestamp from 'react-timestamp';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import IconButton  from '@material-ui/core/IconButton';
import Divider  from '@material-ui/core/Divider';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import ExpansionPanel from '../ExpansionPanel';
import ExpansionPanelSummary from '../ExpansionPanelSummary';
import ExpansionPanelDetails from '../ExpansionPanelDetails';

import TrackList from '../TrackList';
import DeleteButton from '../DeleteButton';
import SyncButton from '../SyncButton';
import { selectPomData } from '../../utils';

import Tags from '../Tags';
import { setPomId } from '../../redux/client';
import { syncPom, toggleSavedPom, playPom, deletePom } from '../../redux/firebase';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

const styles = theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    inline: {
        display: 'inline',
    },
    listItem: {
        width: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
    },
    summary: {
        width: '100%',
        padding: 0,
        margin: 0,
    },
    panel: {
        width: '100%',
        padding: 0,
        margin: 0,
    },
    content: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '& > :last-child': { paddingRight: 0 },
    },
    details: {
        backgroundColor: 'rgba(0,0,0,.03)',
        borderRadius: '0px 0px 2px 2px',
        display: 'flex',
        flexDirection: 'column',
    },
    cover: {
        objectFit: 'cover',
        width: 80,
        height: 80,
    },
    playButton: {
        backgroundColor: 'rgba(0,0,0,.05)',
        width: 80,
        height: 80,
        marginLeft: -80,
    },
    description: {
        paddingTop: 15,
        paddingBottom: 15,
    },
});

function ExpandingPom({
    classes,
    id,
    user,
    pom = {},
    canEdit,
    isFavourite,
    divider = false,
    expanded = false,
    filter,
    playPom = () => {},
    deletePom = () => {},
    toggleSavedPom = () => {},
    syncPom = () => {},
    setPom = () => {},
    remainingSyncs = 0,
    showSaved = false,
    showSync = false,
    showDelete = false,
    handleExpand = () => {},
    ...props
}) {

    const {
        title = '',
        userName = '',
        description = '',
        duration = 0,
        imageSrc = '',
        lastModified = '',
        tracks = [],
    } = pom ? selectPomData(pom) : {};

    const onClick = e => {
        if (e) e.stopPropagation();
        playPom();
    }

    const onDelete = e => {
        if (e) e.stopPropagation();
        deletePom();
    }

    const onToggleSaved = e => {
        if (e) e.stopPropagation();
        toggleSavedPom();
    }

    const onSync = e => {
        if (e) e.stopPropagation();
        syncPom();
    }

    const date = new Date(0); // The 0 sets the date to the epoch
    date.setUTCSeconds(lastModified/1000);

    const isUser = user && user.isLoaded && !user.isEmpty;

    const canModifyTags = filter === "uploads" && canEdit;

    return <Link href="/pom/[id]" as={`/pom/${id}`}>
        <ListItem
            className={classes.listItem}
        >
            <ExpansionPanel className={classes.panel} expanded={expanded}>
            <ExpansionPanelSummary classes={{root: classes.summary, content: classes.content}}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                >
                    <img src={imageSrc} className={classes.cover} />
                    <IconButton aria-label="play" className={classes.playButton} onClick={onClick} >
                        <PlayArrowIcon />
                    </IconButton>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        paddingLeft: 15,
                        paddingRight: 15,
                        width: 'auto',
                    }}>
                        <Typography variant="h6" style={{fontSize: '0.9em',}}>{title}</Typography>
                        <div>
                            <Typography component="span" variant="subtitle1" className={classes.inline} color="textPrimary" style={{fontSize: '0.75em',}}>
                            {userName}
                            </Typography>
                            <Typography component="span" variant="subtitle1" className={classes.inline} color="textPrimary" style={{fontSize: '0.75em',}}>
                            {` — ${duration} mins`}
                            </Typography>
                        <br />
                        <Typography component="span" variant="subtitle1" className={classes.inline} color="textSecondary" style={{fontSize: '0.7em',}}>
                            <Timestamp relative date={date} />
                        </Typography>
                        </div>
                        <div>
                            <Tags id={id} addButton={canModifyTags} deleteButton={canModifyTags} />
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {(isUser && showSaved) ? <IconButton aria-label="Favourite" onClick={onToggleSaved}>
                        {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton> : null}
                    {showSync ? <SyncButton onSync={onSync} title={title} remainingSyncs={remainingSyncs} /> : null}
                    {showDelete ? <DeleteButton onDelete={onDelete} title={title} /> : null}
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.details}>
                {description && <div className={classes.description}>
                    <Typography variant="caption">
                        {description}
                    </Typography>
                </div>}
                <TrackList tracks={tracks} />
                <Button style={{marginTop: 15}} onClick={onClick}>Play Now</Button>
            </ExpansionPanelDetails>
            </ExpansionPanel>
        {divider && <Divider />}
        </ListItem>
    </Link>;
}

ExpandingPom.propTypes = {
    classes: PropTypes.object.isRequired,
};

const ConnectedExpandingPom =  compose(
    firebaseConnect(props => ([
        `pom/${props.id}`,
    ])),
    connect(
        (state, _props) => ({
            pom: _props.id && state.firebase.data.pom && state.firebase.data.pom[_props.id],
            user: state.firebase.profile,
            filter: state.client.filter,
        }),
        (dispatch, ownProps) => bindActionCreators({
            playPom: () => playPom(ownProps.id),
            deletePom: () => deletePom(ownProps.id),
            syncPom: () => syncPom(ownProps.id),
            toggleSavedPom: () => toggleSavedPom(ownProps.id),
            setPom: () => setPomId(ownProps.id),
        }, dispatch)
    ),
)(ExpandingPom);

export default withStyles(styles)(ConnectedExpandingPom);