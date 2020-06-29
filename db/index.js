import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import "firebase/messaging";

import config from '../config';

import {isIOS} from '../utils';

import {initPlayer} from '../spotifyPlayer';

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

export const TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;

export const getAuth = () => {
  return getFirebase().auth()
}

export const GoogleProvider = new firebase.auth.GoogleAuthProvider();

const createGetSpotifyAccessToken = async (uid) => {
  // the goal of this function is to make a function
  // that always returns a valid spotify access token
  // as such, we may need to refresh our access token
  // depending on the time
  const accessTokenRef = getDB().ref(`spotifyAccessToken/${uid}`);
  const refreshRef = getDB().ref(`/refresh/${uid}`);
  let accessToken;
  let accessTokenResolve = () => {};
  accessTokenRef.on('value', snapshot => {
    accessToken = snapshot.val();
    if (accessToken) {
      // check time
      if (accessToken.expires < Date.now()) {
        // trigger refresh
        refreshRef.set(true);
      } else {
        // resolve accessToken.token
        accessTokenResolve(accessToken.token);
      }
    } else {
      // reject
    }
  });

  const getAccessToken = (resolve, reject) => {
    if (!accessToken || accessToken.expires < Date.now()) {
      // we need to refresh, return next access token
      refreshRef.set(true);
      accessTokenResolve = resolve;
    } else {
      // return current access token
      resolve(accessToken.token);
    }
  }

  return () => new Promise((resolve, reject) => { getAccessToken(resolve, reject) });
}

getAuth().onAuthStateChanged(async _user => {
  if (_user) {
      const providerUser = {
          id: _user.uid,
          name: _user.displayName,
          email: _user.email,
          emailVerified: _user.emailVerified,
          photo: _user.photoURL,
          created: _user.metadata.creationTime,
          last: _user.metadata.lastSignInTime,
      }

      // hack to allow reset
      getDB().ref(`/play/${providerUser.id}`).remove();

      getDB().ref(`/onInit/${providerUser.id}`).set(true);

      const userRef = getDB().ref(`users/${providerUser.id}`);
      userRef.once('value', snapshot => {
          const user = snapshot.val();
          if (user) {
              if (!user.syncs) user.syncs = {};
              const today = new Date().toLocaleDateString();
              if (user.syncs.today !== today) {
                  user.syncs.today = today;
                  user.syncs.count = 10;
              }
          }
          userRef.update({
              ...(user || {}),
              ...providerUser,
          });
      });

      const getSpotifyAccessToken = await createGetSpotifyAccessToken(providerUser.id);

      if (isIOS()) {
        getDB().ref(`spotifyDeviceId/${providerUser.id}`).remove();
      } else {
        initPlayer(providerUser.id, getSpotifyAccessToken);
      }

      const param = encodeURIComponent(config.firebaseConfig.messagingSenderId);
      navigator.serviceWorker.register(`static/firebase-messaging-sw.js?messagingSenderId=${param}`)
      .then((registration) => {
          // Request permission and get token....
          const messaging = firebase.messaging();
          messaging.useServiceWorker(registration);
          messaging.requestPermission()
          .then(() => {
              return messaging.getToken();
          })
          .then((token) => {
              // Write the new post's data simultaneously in the posts list and the user's post list.
              console.log('updating token');
              const updates = {};
              updates[`users/${providerUser.id}/messagingTokens/${token}`] = true;
              updates[`notify/${providerUser.id}/${token}`] = true;
              return firebase.database().ref().update(updates);
          })
          .then(() => {
              console.log('posted token');
          })
          .catch((err) => {
              console.log('error:', err);
          })

          messaging.onMessage(function(payload) {
              // This is where we handle notifications in the foreground
              console.log('notification:', payload);
          })

      })
      .catch(err => console.log(err));
  }
});


export default getFirebase;