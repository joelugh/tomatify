import React from 'react';

import { List, ListItem, makeStyles, Divider, Typography, ListSubheader, ListItemIcon, Checkbox, Button } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 500,
        minWidth: 320,
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

export default function ChooseTracks({tracks, state:[checkedTracks=[], setCheckedTracks], onNext, onBack}) {
    const classes = useStyles();

    const [checked, setChecked] = React.useState(checkedTracks.map(item => item.track.id));

    const handleToggle = (value) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      console.log(newChecked);
      setChecked(newChecked);
      setCheckedTracks(tracks.filter(item => newChecked.indexOf(item.track.id) !== -1));
    };

    const duration_ms = checkedTracks.reduce((acc,item) => acc += item.track.duration_ms, 0);

    const isValid = duration_ms/1000/60 < 30 && duration_ms/1000/60 > 20;

    return <>
        <List
            className={classes.root}
            subheader={
                <ListSubheader className={classes.subheader}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <Button onClick={onBack} style={{marginRight:15}}>Back</Button>
                        <Typography>{`Pick tracks (${Math.ceil(duration_ms/1000/60)} mins)`}</Typography>
                    </div>
                    {isValid && <Button onClick={onNext}>Next</Button>}
                </ListSubheader>
            }
        >
            {tracks.map(item => {
                const {id} = item.track
                const labelId = `checkbox-list-label-${id}`;
                return <React.Fragment key={id}>
                    <ListItem button onClick={handleToggle(id)}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                width: 'auto',
                            }}
                        >
                            <Checkbox
                                edge="start"
                                checked={checked.indexOf(id) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                            {/* <img src={(item.track.album.images && item.track.album.images[0] && item.track.album.images[0].url) || ""} height="60" width="60"/> */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginLeft: 15,
                                marginRight: 15,
                                width: 'auto',
                            }}>
                                <Typography variant="subtitle1">{item.track.name}</Typography>
                                <Typography variant="subtitle2">{`by ${item.track.artists && item.track.artists[0] && item.track.artists[0].name}`}</Typography>
                                <Typography variant="caption">{`${item.track.duration_ms/1000} seconds`}</Typography>

                            </div>
                        </div>
                    </ListItem>
                    <Divider/>
                </React.Fragment>
            })}
        </List>
    </>
}