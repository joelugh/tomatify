import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RefreshIcon from '@material-ui/icons/Refresh';

const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        width:'100%',
        padding:20
    },
    card: {
        display: 'flex',
        width: '100%',
        minWidth: '360px',
        maxWidth: '500px',
        justifyContent: 'space-between',
        position: 'relative',
        height: '200px',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
        minHeight: '150px',
    },
    cover: {
        width: 150,
        minWidth: 150,
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
    refreshIcon: {
        height: 15,
        width: 15,
    },
    refreshButton: {
        position: 'absolute',
        left: 0,
        bottom: 0,
    }
});

function RandomCard(props) {

    const {
        classes,
        description = '',
        duration = 0,
        imageSrc = '',
        title = '',
        userName = '',
        onClick = () => {},
        onRefresh = () => {},
    } = props;

    return (
        <div className={classes.root}>
        <Card className={classes.card}>
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography variant="h6" onClick={onClick}>
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
                    <IconButton aria-label="Refresh" className={classes.refreshButton} onClick={onRefresh}>
                     <RefreshIcon className={classes.refreshIcon} />
                    </IconButton>
                </CardContent>
            </div>
            <CardMedia
                className={classes.cover}
                image={imageSrc}
                onClick={onClick}
                title={title}
            >
                <IconButton aria-label="Play/pause">
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

export default withStyles(styles, { withTheme: true })(RandomCard);