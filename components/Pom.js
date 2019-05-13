import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import IconButton  from '@material-ui/core/IconButton';
import Divider  from '@material-ui/core/Divider';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import ExpansionPanel from './ExpansionPanel';
import ExpansionPanelSummary from './ExpansionPanelSummary';
import ExpansionPanelDetails from './ExpansionPanelDetails';

import TrackList from './TrackList';
import DeleteButton from './DeleteButton';
import SyncButton from './SyncButton';

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
        '& > :last-child': { paddingRight: 0 },
    },
    details: {
        backgroundColor: 'rgba(0,0,0,.03)',
        borderRadius: '0px 0px 2px 2px',
        display: 'flex',
        flexDirection: 'column',
    },
    cover: {
        width: 60,
        height: 60,
    },
    playButton: {
        backgroundColor: 'rgba(0,0,0,.05)',
        width: 60,
        height: 60,
        marginLeft: -60,
    },
    description: {
        paddingTop: 15,
        paddingBottom: 15,
    },
});

class ExpandingPom extends React.Component {

    render() {
        const {
            classes,
            title = '',
            userName = '',
            duration = 0,
            lastModified = '',
            isFavourite,
            imageSrc = '',
            divider = false,
            description = '',
            expanded = false,
            onClick: _onClick = () => {},
            onDelete: _onDelete = () => {},
            onToggleSaved: _onToggleSaved = () => {},
            onSync: _onSync = () => {},
            remainingSyncs = 0,
            tracks = [],
            showSaved = false,
            showSync = false,
            showDelete = false,
        } = this.props;


        const onClick = e => {
            if (e) e.stopPropagation();
            _onClick(e);
        }

        const onDelete = e => {
            if (e) e.stopPropagation();
            _onDelete(e);
        }

        const onToggleSaved = e => {
            if (e) e.stopPropagation();
            _onToggleSaved(e);
        }

        const onSync = e => {
            if (e) e.stopPropagation();
            _onSync(e);
        }

        return (
            <ListItem alignItems="flex-start" className={classes.listItem}>
                <ExpansionPanel className={classes.panel} expanded={expanded}>
                <ExpansionPanelSummary classes={{root: classes.summary, content: classes.content}}>
                    <div
                        onClick={this.props.handleExpand}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
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

                            }}>
                                <Typography onClick={onClick} variant="h6" style={{fontSize: '0.9em',}}>{title}</Typography>
                                <div>
                                    <Typography component="span" variant="subtitle1" className={classes.inline} color="textPrimary" style={{fontSize: '0.75em',}}>
                                    {userName}
                                    </Typography>
                                    <Typography component="span" variant="subtitle1" className={classes.inline} color="textPrimary" style={{fontSize: '0.75em',}}>
                                    {` — ${duration} mins`}
                                    </Typography>
                                <br />
                                <Typography component="span" variant="subtitle1" className={classes.inline} color="textSecondary" style={{fontSize: '0.7em',}}>
                                {`${lastModified}`}
                                </Typography>
                                <Typography component="span" variant="subtitle2" className={classes.inline} color="textSecondary" style={{paddingLeft: 10, fontSize: '0.6em',}}>
                                {expanded ? 'less' : 'more'}
                                </Typography>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                        {showSaved ? <IconButton aria-label="Favourite" onClick={onToggleSaved}>
                            {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton> : null}
                        {showSync ? <SyncButton onSync={onSync} title={title} remainingSyncs={remainingSyncs} /> : null}
                        {showDelete ? <DeleteButton onDelete={onDelete} title={title} /> : null}
                        </div>
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
        );
    }
}

ExpandingPom.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExpandingPom);