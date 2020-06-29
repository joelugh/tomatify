const SET_TRACKS = 'SPOTIFY/SET_TRACKS';
const SET_SELECTED_TRACKS = 'SPOTIFY/SET_SELECTED_TRACKS';
const SET_LOADING_PLAYLISTS = 'SPOTIFY/SET_LOADING_PLAYLISTS';
const SET_PLAYLISTS = 'SPOTIFY/SET_PLAYLISTS';
const APPEND_PLAYLISTS = 'SPOTIFY/APPEND_PLAYLISTS';
const CLEAR_PLAYLISTS = 'SPOTIFY/CLEAR_PLAYLISTS';
const SET_SOUND_EFFECTS = 'SPOTIFY/SET_SOUND_EFFECTS';
const SET_PLAY_STATE = 'SPOTIFY/SET_PLAY_STATE';
const SET_PLAY_POM = 'SPOTIFY/SET_PLAY_POM';

import { getDB, TIMESTAMP } from '../db';

function addParamsToUrl(url_str, params = {}) {
  const url = new URL(url_str);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  return url;
}

const spotifyRefresh = async (uid) => {
  getDB().ref(`/refresh/${uid}`).set(true);
}

const selectSpotifyAccessToken = (state) => {
  if (
    !state.firebase.auth ||
    !state.firebase.auth.uid ||
    !state.firebase.data ||
    !state.firebase.data.spotifyAccessToken) return null;
  return state.firebase.data.spotifyAccessToken[state.firebase.auth.uid];
}

const selectSpotifyDeviceId = (state) => {
  if (
    !state.firebase.auth ||
    !state.firebase.auth.uid ||
    !state.firebase.data ||
    !state.firebase.data.spotifyDeviceId) return null;
  return state.firebase.data.spotifyDeviceId[state.firebase.auth.uid];
}

const spotifyFetch = (url, config={}, json=false) => async (dispatch, getState)=> {
  const {params, body: _body, ...otherConfig} = config;
  let body;
  if (_body) body = JSON.stringify(_body);
  if (params) url = addParamsToUrl(url, params);

  const state = getState();
  const uid = state.firebase.auth.uid;
  const spotifyAccessToken = selectSpotifyAccessToken(state);
  console.log(spotifyAccessToken);
  let token = spotifyAccessToken && spotifyAccessToken.token; // unpack

  const attemptFetch = async (token) => fetch(url, {
      ...otherConfig,
      ...(_body && {body}), // conditionally add
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
  });

  let response;
  let attempts = 2;
  do {
      attempts--;
      try {
          response = await attemptFetch(token);
          if (response.status === 401) {
              token = await spotifyRefresh(uid);
          } else {
              break;
          }
      } catch(err) {
          console.log(err);
      }
  } while (attempts > 0);

  let text;
  try {
      text = await response.text();
      const obj = JSON.parse(text);
      return obj;
  } catch (err) {
      if (text) {
          console.log('Response not json:', text);
          return text;
      }
  }

}


export const spotifyInitialState = {
  playlists: [],
  tracks: [],
  selectedTracks: [],
  soundEffects: [],
  loadingPlaylists: false,
  playState: {},
};

export const setLoadingPlaylists = isLoading => {
  return {
    type: SET_LOADING_PLAYLISTS,
    payload: isLoading,
  }
}

const setPlaylists = playlists => {
  return {
    type: SET_PLAYLISTS,
    payload: playlists,
  }
}

const appendPlaylists = playlists => {
  return  {
    type: APPEND_PLAYLISTS,
    payload: playlists
  }
}

export const clearPlaylists = () => {
  return  {
    type: CLEAR_PLAYLISTS,
  }
}

const setTracks = tracks => {
  return {
    type: SET_TRACKS,
    payload: tracks,
  }
}

export const setSelectedTracks = tracks => {
  return {
    type: SET_SELECTED_TRACKS,
    payload: tracks,
  }
}

export const setSoundEffects = tracks => {
  return {
    type: SET_SOUND_EFFECTS,
    payload: tracks,
  }
}
export const setPlayState = playState => {
  return {
    type: SET_PLAY_STATE,
    payload: playState,
  }
}

export const setPlayPom = pomId => {
  return {
    type: SET_PLAY_POM,
    payload: pomId,
  }
}

export const loadSoundEffects = () => async (dispatch, getState) => {
  let tracks = [];
  // old: 1EyTYgcURqWTHoByBzSqaJ
  let next = `https://api.spotify.com/v1/playlists/3IRXph60X9ccaLNVAWQKeY/tracks?offset=0;limit=100`;
  do {
    const response = await dispatch(spotifyFetch(next));
    next = response.next;
    if (response.items) {
      tracks = [...tracks, ...response.items];
    }
  } while(next);
  dispatch(setSoundEffects(tracks));
};

let aud;

export const playTrack = (uri) => async (dispatch, getState) => {
  const uris = [uri];
  const device_id = selectSpotifyDeviceId(getState());
  const response = await dispatch(spotifyFetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      params: { device_id },
      body: { uris },
  }));
  console.log(response);
}

export const pause = () => async (dispatch, getState) => {
  const device_id = selectSpotifyDeviceId(getState());
  const response = await dispatch(spotifyFetch(`https://api.spotify.com/v1/me/player/pause`, {
      method: 'PUT',
      params: { device_id },
  }));
  console.log(response);
}

export const playPreview = (src) => {
  try {
    aud.src = src;
    aud.play();
  } catch (err) {console.log(err)}
}

export const pausePreview = () => {
  try {
    aud.pause();
  } catch (err) {console.log(err)}
}


export const initSpotifyPlaylists = () => async (dispatch, getState) => {
  const state = getState();
  if (state.loadingPlaylists) return;
  aud = new Audio();
  dispatch(setLoadingPlaylists(true));
  dispatch(clearPlaylists());
  let playlists = [];
  let next = "https://api.spotify.com/v1/me/playlists?offset=0;limit=50";
  do {
    const response = await dispatch(spotifyFetch(next));
    next = response.next;
    if (response.items) {
      dispatch(appendPlaylists(response.items));
      playlists = [...playlists, ...response.items];
    }
  } while(next);
  dispatch(setLoadingPlaylists(false))
};

export const loadTracks = (playlistId) => async (dispatch, getState) => {
  // fetch playlists
  let tracks = [];
  let next = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=0;limit=100`;
  do {
    const response = await dispatch(spotifyFetch(next));
    next = response.next;
    if (response.items) {
      tracks = [...tracks, ...response.items];
    }
  } while(next);
  dispatch(setTracks(tracks));
};

export default (state = spotifyInitialState, {type, payload}) => {
  switch (type) {
    case SET_LOADING_PLAYLISTS:
      return { ...state, loadingPlaylists: payload };
    case SET_PLAYLISTS:
      return { ...state, playlists: payload };
    case APPEND_PLAYLISTS:
      return { ...state, playlists: [ ...state.playlists, ...payload] };
    case CLEAR_PLAYLISTS:
      return { ...state, playlists: [] };
    case SET_TRACKS:
      return { ...state, tracks: payload };
    case SET_SELECTED_TRACKS:
      return { ...state, selectedTracks: payload };
    case SET_SOUND_EFFECTS:
      return { ...state, soundEffects: payload };
    case SET_PLAY_POM:
      return { ...state, playState: {
        ...state.playState,
        pom: payload,
      }}
    case SET_PLAY_STATE:
      return {...state, playState: {
        ...state.playState,
        ...payload,
      }}
    default:
      return state;
  }
};
