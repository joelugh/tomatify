import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { List, ListItem, makeStyles, Divider, Typography, ListSubheader, ListItemIcon, Checkbox, Button, Radio, IconButton } from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import { playTrack, pause } from '../../redux/spotify';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    subheader: {
        display: 'flex',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
    }
}));

export default function ChooseSoundEffect({tracks, state: [soundEffect, setSoundEffect], onNext, onBack}) {
    const classes = useStyles();
    const dispatch = useDispatch();

    const soundEffectId = soundEffect && soundEffect.track.id;

    const playState = useSelector(state => state.spotify.playState);
    console.log(playState);

    const handleChange = (id) => {
        const track = tracks.reduce((acc,item) => acc = (item.track.id === id) ? item : acc, null)
        setSoundEffect(track);
    };

    return <>
        <List
            className={classes.root}
            subheader={
                <ListSubheader className={classes.subheader}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <Button onClick={onBack} style={{marginRight:15}}>Back</Button>
                        <Typography>{`Pick a Sound Effect`}</Typography>
                    </div>
                    {soundEffect && <Button onClick={() => onNext()}>Next</Button>}
                </ListSubheader>
            }
        >
            {tracks.map(item => {
                const {id} = item.track
                const labelId = `radio-button-label-${id}`;
                const playing = playState.track && item.track.uri === playState.track && !playState.paused;
                return <div key={id} style={{position:'relative', width:'100%'}}>
                    <ListItem button onClick={() => handleChange(id)}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                width: 'calc(100% - 50px)',
                            }}
                        >
                            <div style={{width: 50}}>
                                <Radio
                                    checked={soundEffectId === id}
                                    onChange={event => handleChange(id)}
                                    value={id}
                                    inputProps={{ 'aria-label': labelId }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginLeft: 15,
                                marginRight: 15,
                                width: 'calc(100% - 100px)',
                                maxWidth: 'calc(100% - 100px)',
                            }}>
                                <Typography variant="subtitle1" noWrap>{item.track.name}</Typography>
                                <Typography variant="subtitle2" noWrap>{`by ${item.track.artists && item.track.artists[0] && item.track.artists[0].name}`}</Typography>
                                <Typography variant="caption">{`${item.track.duration_ms/1000} seconds`}</Typography>

                            </div>
                        </div>
                        <div style={{
                            width: 50,
                        }} />
                    </ListItem>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        paddingRight: 10,
                        width: 50,
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}>
                        <IconButton
                            variant="outlined"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (playing) dispatch(pause());
                                else dispatch(playTrack(item.track.uri));
                            }}
                        >
                            {playing ? <PauseIcon/> : <PlayIcon/>}
                        </IconButton>
                    </div>
                    <Divider/>
                </div>
            })}
        </List>
    </>
}