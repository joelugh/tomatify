import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import "firebase/messaging";

import config from '../config';
const {firebaseConfig = {}} = config;

export const batchUpdate = async (paths = {}, _rootRef) => {
  const rootRef = _rootRef || getDB().ref()
  await rootRef.update(paths)
}

export const getFirebase = () => {

  if (!firebaseConfig) {
    console.warn('Cannot initialise firebase without config variables. Skipping initialisation.')
    return firebase;
  }

  // get firebase config
  try {
    if (firebase.apps.length === 0) {
      console.log('Initialising firebase:', firebaseConfig.databaseURL, firebaseConfig.storageBucket)
      firebase.initializeApp(firebaseConfig);
    }
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }

  return firebase;

};

export const getDB = () => {
  return getFirebase().database()
}

export const getAuth = () => {
  return getFirebase().auth()
}

export default getFirebase;
