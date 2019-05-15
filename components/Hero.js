import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import { Divider } from '@material-ui/core';

const styles = theme => ({
    main: {
        maxWidth: 500,
        margin: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2,
        borderColor: 'rgba(0,0,0,.05)',
        borderStyle: 'solid',
        borderWeight: '1px',
        borderRadius: '1px',
    },
});

class Hero extends React.Component {

    state = {
        more: false,
    }

    render() {
        const {more} = this.state;
        const {classes} = this.props;
        return <div className={classes.main}>
            <Typography variant="h5">Welcome to Tomatify</Typography>
            <Typography variant="subtitle1">A home for Pomodoro Playlists</Typography>
            <br />
            <Divider />
            <br />

            <Collapse in={this.state.more} timeout="auto" unmountOnExit>
                <Typography variant="subtitle2">Pomodoro</Typography>
                <Typography variant="caption" align="justify">
                    Tomato, in Italian.
                </Typography>
                <br />
                <Typography variant="subtitle2">Pomodoro Technique</Typography>
                <Typography variant="caption" align="justify">
                    Work for around 25 minutes (one pomodoro) then take a short break. Repeat.
                    Named for the tomato-shaped kitchen timer.
                </Typography>
                <br />
            </Collapse>

            <Typography variant="subtitle2">Pomodoro Playlist</Typography>
            <Typography variant="caption" align="justify">
                A playlist to time a pomodoro with. Typically 20-30 mins long, includes a couple of loosely themed songs and
                finishes with a sign that time is up.
            </Typography>

            <div style={{width: '100%', display:'flex', justifyContent:'flex-end'}}><Typography component="div" onClick={() => this.setState(state => ({more: !!!state.more}))}>{more ? "less" : "more"}</Typography></div>
        </div>;
    }
}

Hero.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Hero);