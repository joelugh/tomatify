import { getDB } from '../db';

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