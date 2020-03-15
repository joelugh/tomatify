import React from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import he from 'he';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';

import config from '../../config';
import Loading from './../Loading';
import { addPom } from '../../redux/firebase';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: theme.spacing(1),
        maxWidth: 400,
        paddingBottom: 20,
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
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
}))


function Add({
    close,
}) {

    const [uri, setUri] = React.useState('');
    const [playlist, setPlaylist] = React.useState(null);
    const [pending, setPending] = React.useState(false);
    const [warning, setWarning] = React.useState('');
    const dispatch = useDispatch();

    const handlePaste = () => navigator.clipboard.readText().then(clipText => setUri(clipText));

    const handleChange = event => setUri(event.target.value);

    const getIdFromUri = (uri) => {
        const regexes = [
            /^spotify:playlist:(\w+)/,
            /^spotify:user:[\w\.\-\_]+:playlist:(\w+)/,
            /^https:\/\/open\.spotify\.com\/playlist\/(\w+)/,
            /^https:\/\/open\.spotify\.com\/user\/[\w\.\-\_]+\/playlist\/(\w+)/,
        ];
        for (let i = 0; i < regexes.length; i++) {
            const found = uri.match(regexes[i]);
            if (found && found.length == 2) return found[1];
        }
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = getIdFromUri(uri);
        if (!id) {
            setWarning('Bad Link or URI');
            return;
        };
        setPending(true);
        setWarning("");
        axios({
            method: 'post',
            url: `${config.cloudFunctionsBaseUrl}/getSpotifyPlaylist`,
            data: { id },
        }).then((response) => {
            setPending(false);
            setPlaylist(response.data);
        })
    }

    const reset = () => {
        setUri('');
        setPlaylist(null);
        setPending(false);
        setWarning('');
    }

    const handleAdd = () => {
        dispatch(addPom(playlist));
        reset();
        close();
    }

    const classes = useStyles();

    let duration;
    let durationOkay;
    let imageSrc;
    if (playlist) {
        const { tracks, images } = playlist;
        duration = Math.floor(tracks.items.map(t => t.track.duration_ms).reduce((a,b) => a + b, 0)/1000/60);
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
                value={uri}
                onChange={handleChange}
                margin="normal"
                variant="filled"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end" onClick={handlePaste}>
                            📋
                        </InputAdornment>
                    ),
                }}
            />
            {warning && <Typography variant="caption" color="error">{warning}</Typography>}
            <Button onClick={handleSubmit}>Submit</Button>
            </React.Fragment>
        }
        {!pending && playlist &&
            <React.Fragment>
            <img src={imageSrc} className={classes.cover}></img>
            <Typography variant="h6">{playlist.name}</Typography>
            <Typography variant="subtitle1" color={durationOkay ? "inherit" : "error"}>{duration} mins</Typography>
            {playlist.description && <Typography variant="caption" component="span" className={classes.description}>{he.decode(playlist.description)}</Typography>}
            <Button onClick={durationOkay ? handleAdd : reset}>{durationOkay ? "Add" : "Back"}</Button>
            </React.Fragment>
        }
    </div>;
}

export default Add;