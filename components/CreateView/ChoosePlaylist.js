import React from 'react';

import { List, ListItem, makeStyles, Divider, Typography, ListSubheader } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    list: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}));

export default function ChoosePlaylist({playlists, onSelect}) {
    const classes = useStyles();
    return <List
        className={classes.list}
        subheader={
            <ListSubheader className={classes.subheader}>
                Choose Spotify Playlist
            </ListSubheader>
        }
    >
        {playlists.map(playlist => {
            return <React.Fragment key={playlist.id}>
                <ListItem
                    button
                    onClick={() => onSelect(playlist.id)}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            width: 'auto',
                        }}
                    >
                        <img src={(playlist.images && playlist.images[0] && playlist.images[0].url) || ""} height="60" width="60"/>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginLeft: 15,
                            marginRight: 15,
                            width: 'auto',
                        }}>
                            <Typography variant="subtitle1">{playlist.name}</Typography>
                            <Typography variant="subtitle2">{`by ${playlist.owner.display_name}`}</Typography>
                            <Typography variant="caption">{`${playlist.tracks.total} tracks`}</Typography>

                        </div>
                    </div>
                </ListItem>
                <Divider/>
            </React.Fragment>
        })}
    </List>
}