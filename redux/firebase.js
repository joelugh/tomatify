import axios from 'axios';

import {
  isIOS,
} from "../utils";

import { getDB, TIMESTAMP } from '../db';

import config from '../config';
import { setPlayPom } from './spotify';

export const pause = () => async (dispatch, getState) => {
  try {
    const db = getDB();
    const state = getState();
    const {uid} = state.firebase.auth;
    db.ref(`play/${uid}`).set({pause: 1});
  } catch(err){
    console.log(err);
  }
}

export const play = () => async (dispatch, getState) => {
  try {
    const db = getDB();
    const state = getState();
    const {uid} = state.firebase.auth;
    db.ref(`play/${uid}`).set({pause: 0});
  } catch(err){
    console.log(err);
  }
}

export const playPom = (id, idx=0) => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const pomClickRef = db.ref(`clicks/${id}`);
  pomClickRef.transaction(currentClicks => (currentClicks || 0) + 1);
  const {uid} = state.firebase.auth;
  try {
    dispatch(setPlayPom(id));
    db.ref(`play/${uid}`).set({
      id,
      idx,
    });
    if (isIOS()) {
      const spotifyPomPlaylist = state.firebase.data.spotifyPomPlaylist[uid];
      document.location.href = `spotify:playlist:${spotifyPomPlaylist}`;
    }
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

export const addPom = (title, trackItems, soundEffectItem, tags=[], description="") => async (dispatch, getState) => {
  const db = getDB();
  const state = getState();
  const user = state.firebase.profile;
  const userName = user.name;
  const userId = user.id;
  const tracks = trackItems.map(i => i.track);
  const images = tracks.map(t => t && t.album && t.album.images && t.album.images[0]).filter(o => !!o);
  const soundEffect = soundEffectItem.track;
  const durationMs = tracks.map(track => track.duration_ms).reduce((a,b) => a + b, 0);
  const pomRef = db.ref(`pom`);
  const newPomRef = pomRef.push();
  const pomId = newPomRef.key;
  const pomUpdate = {
    title,
    durationMs,
    tracks,
    images,
    userId,
    userName,
    description,
    createTime: TIMESTAMP,
    soundEffect,
  };
  const tagUpdates = {};
  tags.forEach(tag => {
    tagUpdates[`tags/${tag}/${pomId}`] = true;
    tagUpdates[`tagsById/${pomId}/${tag}`] = true;
  })
  await db.ref("/").update({
    [`pom/${pomId}`]: pomUpdate,
    [`users/${userId}/poms/${pomId}`] : 1,
    ...tagUpdates,
  });
  return pomId;
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