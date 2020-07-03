import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';
import Timestamp from 'react-timestamp';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';

import { selectPomData, usePomDetails } from '../../utils';

import Tags from '../Tags';

import {
    syncPom as syncPomAction,
    toggleSavedPom as toggleSavedPomAction,
    playPom as playPomAction,
    deletePom as deletePomAction
} from '../../redux/firebase';

import Link from 'next/link';

import Cover from '../Cover';

const useStyles = makeStyles(theme => ({
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
        height: 120,
        width: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
        display: 'flex',
        justifyContent: 'space-between',
        '& > :last-child': { paddingRight: 0 },
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
    details: {
        // backgroundColor: 'rgba(0,0,0,.03)',
        borderRadius: '0px 0px 2px 2px',
        display: 'flex',
        flexDirection: 'column',
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
}));

function Pom({
    id,
    canEdit,
    isFavourite,
    remainingSyncs = 0,
    showSaved = false,
    showSync = false,
    showDelete = false,
    handleExpand = () => {},
    ...props
}) {

    useFirebaseConnect([
        `tagsById/${id}`,
    ])


    const pom = usePomDetails(id);
    const user = useSelector(state => state.firebase.profile);
    const filter = useSelector(state => state.client.filter);

    const dispatch = useDispatch();
    const classes = useStyles();

    const playPom = () => dispatch(playPomAction(id));
    const deletePom = () => dispatch(deletePomAction(id));
    const toggleSavedPom = () => dispatch(toggleSavedPomAction(id));
    const syncPom = () => dispatch(syncPomAction(id));

    // if (!isLoaded(pom)) return null; /* Causes infinite scroll to load more */

    const {
        title = '',
        userName = '',
        description = '',
        duration = 0,
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
            button
            className={classes.listItem}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: 'auto',
                }}
            >
                <Cover id={id} size={80} />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: 15,
                    marginRight: 15,
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
                    <div style={{display:'flex', flexWrap: 'wrap'}}>
                        <Tags id={id} addButton={canModifyTags} deleteButton={canModifyTags} />
                    </div>
                </div>
            </div>
        </ListItem>
    </Link>;
}

export default Pom;