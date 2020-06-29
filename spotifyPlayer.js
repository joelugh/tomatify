import {getDB} from './db';
import {store} from './redux/configureStore'
import {setPlayState} from './redux/spotify'

let resolveReadyPromise;
let readyPromise = new Promise((resolve, reject) => { resolveReadyPromise = resolve });

if (global.window) window.onSpotifyWebPlaybackSDKReady = () => {
  resolveReadyPromise();
}

export const initPlayer = async (uid, getToken) => {
    const [_] = await Promise.all([readyPromise]);
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: async cb => cb(await getToken()),
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(`initialization_error: ${message}`); });
    player.addListener('authentication_error', ({ message }) => { console.error(`authentication_error: ${message}`); });
    player.addListener('account_error', ({ message }) => { console.error(`account_error: ${message}`); });
    player.addListener('playback_error', ({ message }) => { console.error(`playback_error: ${message}`); });

    // Playback status updates
    // const currentlyPlayingRef = getDB().ref(`currentlyPlaying/${uid}`);
    let paused = true;
    player.addListener('player_state_changed', state => {
      paused = (!state) || (state && state.paused);
      const playState = {
        track: state && state.track_window && state.track_window.current_track  && state.track_window.current_track.uri,
        progress: state && state.position,
        now: !paused && Date.now(),
        paused,
      }
      if (store && store.dispatch) store.dispatch(setPlayState(playState));
      // currentlyPlayingRef.update(playState);
    });

    // Ready
    const spotifyDeviceIdRef = getDB().ref(`spotifyDeviceId/${uid}`)
    spotifyDeviceIdRef.remove();
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      spotifyDeviceIdRef.set(device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
};