import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Router from 'next/router';
import { makeStyles, Paper } from '@material-ui/core';

import { initSpotifyPlaylists, loadTracks, setSelectedTracks, loadSoundEffects } from '../../redux/spotify';
import { addPom } from '../../redux/firebase';
import { useSpotifyAccessToken } from '../../utils';
import ChoosePlaylist from './ChoosePlaylist';
import ChooseTracks from './ChooseTracks';
import SortTracks from './SortTracks';
import ChooseSoundEffect from './ChooseSoundEffect';
import ChooseTags from './ChooseTags';
import ChooseName from './ChooseName';
import ChooseDescription from './ChooseDescription';
import Loading from '../Loading';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;

const useStyles = makeStyles(theme => ({
    root: {
        width: '100vw',
        minHeight: 'calc(100vh - 60px)',
        maxWidth: 500,
        minWidth: 320,
        backgroundColor: theme.palette.background.paper,
    },
}));


export default function CreateView(props) {

    const classes = useStyles();
    const dispatch = useDispatch();
    const [screen, setScreen] = React.useState(0);
    const [loadedPlaylists, setLoadedPlaylists] = React.useState();
    const [playlistId, setPlaylistId] = React.useState();
    const [selectedTracks, setSelectedTracks] = React.useState();
    const [sortedTracks, setSortedTracks] = React.useState();
    const [soundEffect, setSoundEffect] = React.useState();
    const [tags, setTags] = React.useState();
    const [description, setDescription] = React.useState();
    const [name, setName] = React.useState();
    const [loading, setLoading] = React.useState();
    const spotifyAccessToken = useSpotifyAccessToken();
    const nextScreen = () => {
        setScreen(screen => screen+1);
        window.scrollTo(0,0);
    };
    const prevScreen = () => {
        setScreen(screen => screen-1);
        window.scrollTo(0,0);
    };

    const playlists = useSelector(state => state.spotify.playlists);
    const playlistTracks = useSelector(state => state.spotify.tracks);
    const soundEffects = useSelector(state => state.spotify.soundEffects);

    React.useEffect(() => {
        setSortedTracks(selectedTracks);
    },[selectedTracks])

    React.useEffect(() => {
        if (playlistId) dispatch(loadTracks(playlistId));
    },[playlistId])

    React.useEffect(() => {
        if (spotifyAccessToken && !loadedPlaylists) {
            setLoadedPlaylists(true);
            dispatch(initSpotifyPlaylists());
            dispatch(loadSoundEffects());
        }
    },[spotifyAccessToken]);

    const onAddPom = async () => {
        setLoading(true);
        const pomId = await dispatch(addPom(name, sortedTracks, soundEffect, tags, description));
        Router.push('/pom/[id]', `/pom/${pomId}`);
    }

    const screens = [
        <ChoosePlaylist playlists={playlists} onSelect={id => {setPlaylistId(id); nextScreen()}} />,
        <ChooseTracks tracks={playlistTracks} state={[selectedTracks,setSelectedTracks]} onNext={nextScreen} onBack={prevScreen} />,
        <SortTracks state={[sortedTracks, setSortedTracks]} onNext={nextScreen} onBack={prevScreen} />,
        <ChooseSoundEffect tracks={soundEffects} state={[soundEffect, setSoundEffect]} onNext={nextScreen} onBack={prevScreen} />,
        <ChooseTags state={[tags,setTags]} onNext={nextScreen} onBack={prevScreen}/>,
        <ChooseDescription state={[description, setDescription]} onNext={nextScreen} onBack={prevScreen} />,
        <ChooseName state={[name, setName]} onNext={onAddPom} onBack={prevScreen} />,
    ];
    if (loading || !playlists || playlists.length == 0) return <Loading />
    return <Paper className={classes.root}>
        {screens[screen]}
    </Paper>;
}
