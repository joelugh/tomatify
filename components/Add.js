import React from 'react';
import axios from 'axios';
import he from 'he';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import blue from '@material-ui/core/colors/blue';
import InputAdornment from '@material-ui/core/InputAdornment';

import config from '../config';
import Loading from './Loading';

const AddStyles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: theme.spacing.unit,
        maxWidth: 400,
        paddingBottom: 20,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    dense: {
        marginTop: 16,
    },
    menu: {
        width: 200,
    },
    cover: {
        boxShadow: '2px 2px 2px darkgrey',
        height: 120,
        width: 120,
        borderRadius: 2,
        marginBottom: 20,
    },
    description: {
        margin: 10,
        textAlign: 'justify',
        maxWidth: 280,
        wordWrap: 'break-word'
    }
});

class Add extends React.Component {
    state = {
        uri: '',
        playlist: null,
        pending: false,
        warning: '',
    };

    handlePaste = () => {
        navigator.clipboard.readText().then(clipText => {
            this.setState({uri: clipText});
        });
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    getIdFromUri = (uri) => {
        const regexes = [
            /^spotify:playlist:(\w+)/,
            /^spotify:user:[\w\.]+:playlist:(\w+)/,
            /^https:\/\/open\.spotify\.com\/playlist\/(\w+)/,
            /^https:\/\/open\.spotify\.com\/user\/[\w\.]+\/playlist\/(\w+)/,
        ];
        for (let i = 0; i < regexes.length; i++) {
            const found = uri.match(regexes[i]);
            if (found && found.length == 2) return found[1];
        }
        return null;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const {uri} = this.state;
        const id = this.getIdFromUri(uri);
        if (!id) {
            this.setState({warning: 'Bad Link or Uri'});
            return;
        };
        this.setState({pending: true, warning:''});
        axios({
            method: 'post',
            url: `${config.cloudFunctionsBaseUrl}/getSpotifyPlaylist`,
            data: { id },
        }).then((response) => {
            this.setState({pending:false, playlist: response.data});
        })
    }

    reset = () => {
        this.setState({
            uri: '',
            playlist: null,
            pending: false,
            warning: '',
        })
    }

    handleAdd = () => {
        this.props.onAdd(this.state.playlist);
        this.reset();
        this.props.close();
    }

    render() {
        const { warning, playlist, pending } = this.state;
        const { classes } = this.props;
        let duration;
        let durationOkay;
        let imageSrc;
        if (playlist) {
            const { tracks, images } = playlist;
            duration = Math.round(tracks.items.map(t => t.track.duration_ms).reduce((a,b) => a + b, 0)/1000/60);
            durationOkay = (duration >= 20) && (duration <= 30);
            imageSrc = images && ((images.length > 1 && images[1].url) || (images.length > 0 && images[0].url) || null)
        }

        return <div className={classes.container}>
            {pending && <Loading />}
            {!pending && !playlist &&
                <React.Fragment>
                <Typography variant="caption" style={{maxWidth: 200}}>Link a playlist that hits the sweet spot (20-30 mins).</Typography>
                <TextField
                    autoFocus
                    label="Link or Uri"
                    className={classes.textField}
                    value={this.state.uri}
                    onChange={this.handleChange('uri')}
                    margin="normal"
                    variant="filled"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" onClick={this.handlePaste}>
                                📋
                            </InputAdornment>
                        ),
                    }}
                />
                {warning && <Typography variant="caption" color="error">{warning}</Typography>}
                <Button onClick={this.handleSubmit}>Submit</Button>
                </React.Fragment>
            }
            {!pending && playlist &&
                <React.Fragment>
                <img src={imageSrc} className={classes.cover}></img>
                <Typography variant="h6">{playlist.name}</Typography>
                <Typography variant="subtitle1" color={durationOkay ? "inherit" : "error"}>{duration} mins</Typography>
                {playlist.description && <Typography variant="caption" component="span" className={classes.description}>{he.decode(playlist.description)}</Typography>}
                <Button onClick={durationOkay ? this.handleAdd : this.reset}>{durationOkay ? "Add" : "Back"}</Button>
                </React.Fragment>
            }
        </div>;
    }
}

Add.propTypes = {
    classes: PropTypes.object.isRequired,
};

const AddWrapped = withStyles(AddStyles)(Add);


class AddDialog extends React.Component {

    handleClose = () => this.props.onClose(this.props.selectedValue);

    handleListItemClick = value => this.props.onClose(value);

    render() {
        const { classes, onClose, selectedValue, onAdd, ...other } = this.props;

        return (
            <Dialog onClose={this.handleClose} aria-labelledby="add-dialog-title" {...other}>
                <DialogTitle id="add-dialog-title">Enter Playlist Details</DialogTitle>
                <AddWrapped onAdd={onAdd} close={this.handleClose} />
            </Dialog>
        );
    }
}

AddDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    selectedValue: PropTypes.string,
};


const AddDialogStyles = {
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
};

const AddDialogWrapped = withStyles(AddDialogStyles)(AddDialog);

class AddButton extends React.Component {
    state = {
        open: false,
    };

    handleClickOpen = () => {
        this.setState({
            open: true,
        });
    };

    handleClose = () => {
        this.setState({open: false });
    };

    render() {

        const { userName = '', ...otherProps } = this.props;

        return (
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleClickOpen}
                    style={{margin: 15}}
                >
                    Add Pomodoro Playlist
                </Button>
                <AddDialogWrapped
                    open={this.state.open}
                    onClose={this.handleClose}
                    {...otherProps}
                />
            </div>
        );
    }
}

export default AddButton;