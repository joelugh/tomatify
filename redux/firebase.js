import axios from 'axios';

import { getDB, TIMESTAMP } from '../db';

import config from '../config';

export const playPom = (id) => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const pomClickRef = db.ref(`clicks/${id}`);
  pomClickRef.transaction(currentClicks => (currentClicks || 0) + 1);
  try {
    const {uri} = state.firebase.data.pom[id];
    document.location.href = uri;
  } catch(err){}
}


export const toggleSavedPom = (id) => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  try {
    const {uid} = state.firebase.auth;
    const savedPomRef = db.ref(`users/${uid}/saved/${id}`);
    savedPomRef.transaction(isSaved => isSaved ? null : 1);
  } catch(err) { console.log(err) }
}


export const addPom = (playlist) => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const {
      uri,
      name: title,
  } = playlist;
    const user = state.firebase.profile;
    const userName = user.name;
    const userId = user.id;
    const duration = playlist.tracks.items.map(t => t.track.duration_ms).reduce((a,b) => a + b, 0)/1000;
    const pomRef = db.ref(`pom/${uri}`);
    pomRef.set({
        uri,
        title,
        duration,
        userId,
        userName,
        createTime: TIMESTAMP,
        spotify: playlist,
    });
    db.ref(`users/${userId}/poms/${uri}`).set(1);
}


export const syncPom = (_id) => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const user = state.firebase.profile;
  const id = _id.split(':').pop();
  const syncCountRef = db.ref(`users/${user.id}/syncs/count`);
  syncCountRef.transaction(count => count > 0 ? count - 1 : 0);
  axios({
      method: 'post',
      url: `${config.cloudFunctionsBaseUrl}/getSpotifyPlaylist`,
      data: { id },
  })
  .then((response) => {
      const {
          uri,
          name: title,
      } = response.data;
      const duration = response.data.tracks.items.map(t => t.track.duration_ms).reduce((a,b) => a + b, 0)/1000;
      const pomRef = db.ref(`pom/${_id}`);
      pomRef.transaction(pom => ({
          ...pom,
          uri,
          title,
          duration,
          spotify: response.data,
      }));
  }).catch(err => console.log(err))

}


export const deletePom = (id) => (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const user = state.firebase.profile;
  if (!user || !user.id) return;
  db.ref(`pom/${id}`).remove();
  db.ref(`users/${user.id}/poms/${id}`).remove();
}