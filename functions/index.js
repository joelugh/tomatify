/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */

const functions = require('firebase-functions');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');
const fetch = require("node-fetch");
const base64 = require('base-64');
const qs = require('qs');
const { Expo } = require('expo-server-sdk');


exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

const config = require('./config');

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
// admin.initializeApp(config.firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
});

// Spotify OAuth 2 setup
// TODO: Configure the `spotify.client_id` and `spotify.client_secret` Google Cloud environment variables.
const SpotifyWebApi = require('spotify-web-api-node');
const Spotify = new SpotifyWebApi({
  clientId: functions.config().spotify.client_id,
  clientSecret: functions.config().spotify.client_secret,
  redirectUri: functions.config().spotify.redirect_uri, // `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com/popup.html`,
});

// Scopes to request.
const OAUTH_SCOPES = [
    "ugc-image-upload",
    "playlist-read-private",
    "playlist-modify-public",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "user-read-currently-playing",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-recently-played",
    "user-top-read",
    "user-follow-read",
    "user-follow-modify",
    "app-remote-control",
    "streaming",
    "user-read-private",
    "user-read-email",
    "user-library-modify",
    "user-library-read",
];

const withCors = func => (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
    } else {
        func(req, res);
    }
}

exports.getSpotifyPlaylist = withCors((req, res) => {

    const playlistId =
    req.query && req.query.id ? req.query.id :
    req.body && req.body.id ? req.body.id : null;

    if (!playlistId) res.send();

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        auth: {
            username: config.spotifyUsername,
            password: config.spotifyPassword,
        },
        data: querystring.stringify({
            grant_type: 'client_credentials'
        })
    }).then((response) => {
        // Once we get the response, extract the access token from the response body
        const accessToken = response.data.access_token
        axios({
            method: 'get',
            url: `https://api.spotify.com/v1/playlists/${playlistId}`,
            headers: {
                authorization: `Bearer ${accessToken}`,
            }
        }).then((response) => {
            res.send(response.data);
        }).catch((err) => { });
    }).catch((err) => { });

});


const calcRecent = (request, response) => {
    const dbRef = admin.database().ref();
    return dbRef.once("value")
    .then(snapshot => {
        const db = snapshot.val();
        const recentAll = Object.keys(db.pom || {}).sort((a,b) => db.pom[b].createTime - db.pom[a].createTime);
        const oneMonthMillis = 1000*60*60*24*30;
        const oneWeekMillis = 1000*60*60*24*7;
        const recentMonth = recentAll.filter(id => Date.now() - db.pom[id].createTime < oneMonthMillis);
        const recentWeek = recentAll.filter(id => Date.now() - db.pom[id].createTime < oneWeekMillis);
        return Promise.all([
            admin.database().ref("recent/all").set(recentAll),
            admin.database().ref("recent/month").set(recentMonth),
            admin.database().ref("recent/week").set(recentWeek),
            admin.database().ref("recent/lastRun").set(Date.now()),
        ])
    });
}

const calcPopular = (context) => {
    const SAVED_MULTIPLIER = 1000;
    const dbRef = admin.database().ref();
    return dbRef.once("value")
    .then(snapshot => {
        const pomScores = {};
        const db = snapshot.val();
        if (db.pom) Object.keys(db.pom).forEach(pomId => {
            // initialise all to 0
            pomScores[pomId] = 0;
        });
        if (db.clicks) Object.keys(db.clicks).forEach(pomId => {
            const clicks = parseInt(db.clicks[pomId],10);
            pomScores[pomId] = pomScores[pomId] ? pomScores[pomId] + clicks : clicks;
        })
        if (db.users) Object.keys(db.users).forEach(userId => {
            const user = db.users[userId];
            if (!user.saved) return;
            Object.keys(user.saved).forEach(pomId => {
                if (!db || !db.pom || !db.pom[pomId]) return;
                if (db.pom[pomId].userId == userId) return;
                pomScores[pomId] = pomScores[pomId] ? pomScores[pomId] + SAVED_MULTIPLIER : SAVED_MULTIPLIER;
            })

        });
        const top = Object.keys(pomScores).map(pomId => [pomId, pomScores[pomId]]).sort((a,b) => b[1]-a[1]).map(o => ({ id: o[0], score: o[1] }));
        const topAll = top.filter(o => db.pom && db.pom[o.id]);
        const oneMonthMillis = 1000*60*60*24*30;
        const oneWeekMillis = 1000*60*60*24*7;
        const topMonth = top.filter(o => db.pom && db.pom[o.id] && Date.now() - db.pom[o.id].createTime < oneMonthMillis);
        const topWeek = top.filter(o => db.pom && db.pom[o.id] && Date.now() - db.pom[o.id].createTime < oneWeekMillis);
        return Promise.all([
            admin.database().ref("popular/all").set(topAll),
            admin.database().ref("popular/month").set(topMonth),
            admin.database().ref("popular/week").set(topWeek),
            admin.database().ref("popular/lastRun").set(Date.now()),
        ]);
    });
}

const calcTags = () => {

    /* EXPERIMENTAL */
    const NEW_POM = "hatching_chick";
    const HOT_POM = "fire";
    const TOP_POM = "100";
    const ALBUM_POM = "cd";
    const ARTIST_POM = "microphone";

    const dbRef = admin.database().ref();
    return dbRef.once("value")
    .then(snapshot => {
        const db = snapshot.val();
        const tagsById = db.tagsById ? db.tagsById : {};
        const tags = db.tags ? db.tags : {};
        tags[NEW_POM] = {};
        tags[HOT_POM] = {};
        tags[TOP_POM] = {};
        tags[ALBUM_POM] = {};
        tags[ARTIST_POM] = {};

        const promises = [];

        if (db.pom) Object.keys(db.pom).forEach(pomId => {
            const pom = db.pom[pomId];
            const {
                userId = '',
                tracks: _tracks = [],
            } = pom;
            const tracks = _tracks.map(({name, duration_ms, uri, artists, album}) => ({
                title: name,
                artists: artists.map((artist) => artist.name),
                album: album.name,
                duration_ms,
                uri,
            }));
            let isArtistPom = tracks.length > 0;
            let isAlbumPom = tracks.length > 0;
            const artists = tracks.length > 0 ? tracks[0].artists : [];
            const album = tracks.length > 0 ? tracks[0].album : '';
            let validTracks = 0;
            tracks.forEach(track => {
                if (track.duration_ms <= 1000*60) return;
                validTracks++;
                let foundArtist = false;
                let foundAlbum = false;
                if (track.album == album) foundAlbum = true;
                artists.forEach(artist => {
                    if (
                        (track.artists.indexOf(artist) !== -1)
                        ||
                        (track.title.indexOf(artist) !== -1 && (/remix/i).test(track.title))
                    ) foundArtist = true;
                })
                if (!foundArtist) isArtistPom = false;
                if (!foundAlbum) isAlbumPom = false;
            })

            if (validTracks < 3) {
                isArtistPom = false;
                isAlbumPom = false;
            }

            let isNewPom = (db.popular && db.popular["week"]) ? db.popular["week"].slice(0,20).reduce((bool, p) => bool || p.id == pomId, false) : false;
            let isHotPom = (db.popular && db.popular["month"]) ? db.popular["month"].slice(0,20).reduce((bool, p) => bool || p.id == pomId, false) : false;
            let isTopPom = (db.popular && db.popular["all"]) ? db.popular["all"].slice(0,20).reduce((bool, p) => bool || p.id == pomId, false) : false;

            tagsById[pomId] = tagsById[pomId] ? tagsById[pomId] : {};

            if (isAlbumPom) {
                tags[ALBUM_POM][pomId] = true;
                tagsById[pomId][ALBUM_POM] = true;
                tagsById[pomId][ARTIST_POM] = null;
            } else if (isArtistPom) {
                tags[ARTIST_POM][pomId] = true;
                tagsById[pomId][ARTIST_POM] = true;
                tagsById[pomId][ALBUM_POM] = null;
            } else {
                tagsById[pomId][ARTIST_POM] = null;
                tagsById[pomId][ALBUM_POM] = null;
            }

            if (isTopPom) {
                tags[TOP_POM][pomId] = true;
                tagsById[pomId][TOP_POM] = true;
                tagsById[pomId][HOT_POM] = null;
                tagsById[pomId][NEW_POM] = null;
            } else if (isHotPom) {
                tags[HOT_POM][pomId] = true;
                tagsById[pomId][HOT_POM] = true;
                tagsById[pomId][TOP_POM] = null;
                tagsById[pomId][NEW_POM] = null;
            } else if (isNewPom) {
                tags[NEW_POM][pomId] = true;
                tagsById[pomId][NEW_POM] = true;
                tagsById[pomId][HOT_POM] = null;
                tagsById[pomId][TOP_POM] = null;
            } else {
                tagsById[pomId][HOT_POM] = null;
                tagsById[pomId][TOP_POM] = null;
                tagsById[pomId][NEW_POM] = null;
            }
            promises.push(admin.database().ref(`tagsById/${pomId}`).set(tagsById[pomId]));
        })

        return Promise.all([
            admin.database().ref(`tags/${TOP_POM}`).set(tags[TOP_POM]),
            admin.database().ref(`tags/${HOT_POM}`).set(tags[HOT_POM]),
            admin.database().ref(`tags/${NEW_POM}`).set(tags[NEW_POM]),
            admin.database().ref(`tags/${ALBUM_POM}`).set(tags[ALBUM_POM]),
            admin.database().ref(`tags/${ARTIST_POM}`).set(tags[ARTIST_POM]),
            ...promises,
        ]);
    })

}

const notifyExpoTokens = (snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    let expo = new Expo();
    const original = snapshot.val();
    // const images = original.spotify.images;
    // const imageSrc = images && ((images.length > 1 && images[1].url) || (images.length > 0 && images[0].url) || null);

    const expoTokensRef = admin.database().ref('/expoPushToken');
    return expoTokensRef.once("value")
    .then(snapshot => {
        const users = snapshot.val();
        if (!users) return;
        const tokens = Object.keys(users).map(id => users[id]);
        // Create the messages that you want to send to clents
        let messages = [];
        for (let pushToken of tokens) {
            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }

            // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
            /*
            title: 'Original Title',
            body: 'And here is the body!',
            data: { data: 'goes here' },
            _displayInForeground: true,

                data: {
                title: `Listen to ${original.title}`,
                userName: `By ${original.userName}`,
                imageSrc: imageSrc || "",
            },
            */
            messages.push({
                to: pushToken,
                sound: 'default',
                title: `Listen to ${original.title}`,
                body: `By ${original.userName}`,
                _displayInForeground: true,
            })
        }
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
            // Send the chunks to the Expo push notification service. There are
            // different strategies you could use. A simple one is to send one chunk at a
            // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
                    tickets.push(...ticketChunk);
                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    });
}


const notifyUsers = (snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();

    const images = original.spotify.images;
    const imageSrc = images && ((images.length > 1 && images[1].url) || (images.length > 0 && images[0].url) || null);

    // This registration token comes from the client FCM SDKs.
    const notifyUsersRef = admin.database().ref('/notify');
    return notifyUsersRef.once("value")
    .then(snapshot => {
        const users = snapshot.val();
        if (!users) return;
        const promises = Object.keys(users).map(id => {
            const userTokens = users[id];
            if (!userTokens) return;
            const tokens = Object.keys(userTokens).filter(token => !!userTokens[token]);
            const promises = tokens.map(token => {
                const message = {
                    data: {
                        title: `Listen to ${original.title}`,
                        userName: `By ${original.userName}`,
                        imageSrc: imageSrc || "",
                    },
                    token,
                };
                // Send a message to the device corresponding to the provided
                // registration token.
                // TODO: Should listen to these responses and remove tokens which are no longer valid
                return admin.messaging().send(message);
            });
            return Promise.all(promises.map(p => p.catch(e => e)));
        });
        Promise.all(promises.map(p => p.catch(e => e)))
        .then((responses) => {
            console.log(`Successfully sent message for ${original.title}`);
        })
        .catch((error) => {
            console.log(`Error sending message for ${original.title}:`, error);
        });

    });
}

exports.updateAll = functions.https.onRequest(() => {
    return Promise.resolve()
    .then(() => calcRecent())
    .then(() => calcPopular())
    .then(() => calcTags())
});

exports.calcTags = functions.https.onRequest(calcTags);
exports.calcRecent = functions.https.onRequest(calcRecent);
exports.calcPopular = functions.https.onRequest(calcPopular);
exports.scheduledCalcMostPopular = functions.pubsub.schedule('every 1 hours')
.onRun((context) => {
    return Promise.resolve()
    .then(() => calcRecent())
    .then(() => calcPopular())
    .then(() => calcTags());
});

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.newPomNotify = functions.database.ref('/pom/{pushId}')
.onCreate((snapshot, context) => {
    // Update recent and popular
    return Promise.resolve()
    .then(() => calcRecent())
    .then(() => calcPopular())
    .then(() => calcTags())
    .then(() => notifyUsers(snapshot, context));
})

exports.deletePom = functions.database.ref('/pom/{pushId}')
.onDelete((snapshot, context) => {
    // Update recent and popular
    return Promise.resolve()
    .then(() => calcRecent())
    .then(() => calcPopular())
})

exports.notifyExpoTokens = functions.database.ref('/pom/{pushId}')
.onCreate((snapshot,context) => {
    return Promise.resolve()
    .then(() => notifyExpoTokens(snapshot, context));
});

function addParamsToUrl(url_str, params = {}) {
    const url = new URL(url_str);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    return url;
}

const spotifyRefresh = async (uid) => {
    /*
        POST https://accounts.spotify.com/api/token

        The body of this POST request must contain the following parameters encoded
        in application/x-www-form-urlencoded as defined in the OAuth 2.0 specification:

        REQUEST BODY PARAMETER	VALUE
        grant_type	Required. Set it to refresh_token.
        refresh_token	Required. The refresh token returned from the authorization code exchange.

        HEADER PARAMETER	VALUE
        Authorization	Required.
        Base 64 encoded string that contains the client ID and client secret key.
        The field must have the format:
            Authorization: Basic <base64 encoded client_id:client_secret>
    */
    console.log(`refreshing token for ${uid}`);

    // TODO: consider moving this to the end to prevent dos
    admin.database().ref(`/refresh/${uid}`).remove();

    const spotifyAccessTokenRef = admin.database().ref(`spotifyAccessToken/${uid}`);
    const spotifyRefreshTokenRef = admin.database().ref(`spotifyRefreshToken/${uid}`);
    const spotifyRefreshTokenSnapshot = await spotifyRefreshTokenRef.once('value');
    const spotifyRefreshToken = spotifyRefreshTokenSnapshot.val();
    const clientId = functions.config().spotify.client_id;
    const clientSecret = functions.config().spotify.client_secret;
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method:'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(clientId + ":" + clientSecret),
            },
            body: qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: spotifyRefreshToken,
            })
        });
        const text = await response.text();
        const res = JSON.parse(text);
        await spotifyAccessTokenRef.set({
            token: res.access_token,
            expires: Date.now() + parseInt(res.expires_in,10)*1000 - 5*60*1000, // remove 5 minutes conservatively
        });
        console.log(`refreshed ${uid} with ${res.access_token}`);
        return res.access_token;
    } catch (err) {
        console.log(err);
    }
}

exports.refreshSpotifyAccessTokenDb = functions.database.ref('/refresh/{userId}/')
.onCreate((snapshot, context) => spotifyRefresh(context.params.userId))


const spotifyFetch = async (uid, url, config={}, json=false) => {
    const {params, body: _body, ...otherConfig} = config;
    let body;
    if (_body) body = JSON.stringify(_body);
    if (params) url = addParamsToUrl(url, params);

    const spotifyAccessTokenRef = admin.database().ref(`spotifyAccessToken/${uid}`);
    const spotifyAccessTokenSnapshot = await spotifyAccessTokenRef.once('value');
    const spotifyAccessToken = spotifyAccessTokenSnapshot.val();
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

async function createPlaylist(userId, name, description, isPublic=false, isCollaborative=false) {
    // Create a playlist
    const spotifyUidRef = admin.database().ref(`spotifyUid/${userId}`);
    const spotifyUidSnapshot = await spotifyUidRef.once('value');
    const spotifyUid = spotifyUidSnapshot.val();
    return spotifyFetch(userId, `https://api.spotify.com/v1/users/${spotifyUid}/playlists`, {
        method: 'POST',
        body: {
            name,
            public: isPublic,
            collaborative: isCollaborative,
            ...(description && {description}),
        }
    });
}

const onInit = async (snapshot, context) => {
    const userId = context.params.userId;
    admin.database().ref(`/onInit/${userId}`).remove();

    const spotifyPomPlaylistRef = admin.database().ref(`spotifyPomPlaylist/${userId}`);
    const spotifyPomPlaylistSnapshot = await spotifyPomPlaylistRef.once('value');
    const spotifyPomPlaylist = spotifyPomPlaylistSnapshot.val();

    if (spotifyPomPlaylist) {
        const response = await spotifyFetch(userId, `https://api.spotify.com/v1/playlists/${spotifyPomPlaylist}`);
        if (response && response.id && response.id === spotifyPomPlaylist) return;
    }

    await createPlaylist(
        userId,
        "Tomatify :: Pom Player",
        "One place for all your poms",
    )
    .then(playlist => {
        spotifyPomPlaylistRef.set(playlist.id);
    });

}

exports.onInitDb = functions.database.ref('/onInit/{userId}/').onCreate(onInit)

const playPom = async (snapshot, context) => {
    const {id, idx, pause} = snapshot.val() || {};
    const userId = context.params.userId;

    console.log(`userId: ${userId}, pomId: ${id}, idx: ${idx}, pause: ${pause}`);

    admin.database().ref(`/play/${userId}`).remove();

    if (pause) {
        // special case - pause playback
        const response = await spotifyFetch(userId, `https://api.spotify.com/v1/me/player/pause`, {
            method: 'PUT',
            // ...(device_id && {params: { device_id }}),
        });
        console.log(`response: ${JSON.stringify(response)}`);
        return;
    }

    if (!id) {
        // special case - resume play
        const response = await spotifyFetch(userId, `https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            // ...(device_id && {params: { device_id }}),
        });
        console.log(`response: ${JSON.stringify(response)}`);
        return;
    };

    const spotifyPomPlaylistRef = admin.database().ref(`spotifyPomPlaylist/${userId}`);
    const spotifyPomPlaylistSnapshot = await spotifyPomPlaylistRef.once('value');
    const spotifyPomPlaylist = spotifyPomPlaylistSnapshot.val();

    console.log(`spotifyPomPlaylist: ${spotifyPomPlaylist}`);

    const pomRef = admin.database().ref(`pom/${id}`);
    const pomSnapshot = await pomRef.once('value');
    const pom = pomSnapshot.val();

    const uris = pom.tracks.map(track => track.uri).slice(idx);
    if (pom.soundEffect) uris.push(pom.soundEffect.uri);

    if (uris.length <= 0) return;

    console.log(`uris: ${JSON.stringify(uris)}`);

    const spotifyDeviceIdRef = admin.database().ref(`spotifyDeviceId/${userId}`);
    const spotifyDeviceIdSnapshot = await spotifyDeviceIdRef.once('value');
    const device_id = spotifyDeviceIdSnapshot.val();

    const currentlyPlayingRef = admin.database().ref(`currentlyPlaying/${userId}`);
    currentlyPlayingRef.update({
        pom: id,
        progress: 0,
        track: uris[0],
        paused: false,
    });

    try {
        if (device_id) {

            const response = await spotifyFetch(userId, `https://api.spotify.com/v1/me/player/play`, {
                method: 'PUT',
                ...(device_id && {params: { device_id }}),
                body: { uris },
            });
            console.log(`response: ${JSON.stringify(response)}`);

        } else {

            const response = await spotifyFetch(userId, `https://api.spotify.com/v1/playlists/${spotifyPomPlaylist}/tracks`, {
                method: 'PUT',
                body: { uris },
            });
            console.log(`response: ${JSON.stringify(response)}`);

        }
    } catch(err) {
        console.log(err);
    }
}

exports.playPomDb = functions.database.ref('/play/{userId}/').onCreate(playPom)


/**************************************
 *       SPOTIFY AUTHENTICATION       *
 **************************************/

/**
 * Redirects the User to the Spotify authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 */
exports.redirect = functions.https.onRequest((req, res) => {
    cookieParser()(req, res, () => {
        const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
        console.log('Setting verification state:', state);
        res.cookie('state', state.toString(), {maxAge: 3600000, secure: true, httpOnly: true, sameSite:'none'});
        if (req.query.redirect_uri) {
            Spotify.setRedirectURI(req.query.redirect_uri);
            console.log(`redirecting to ${req.query.redirect_uri}`);
        }
        const authorizeURL = Spotify.createAuthorizeURL(OAUTH_SCOPES, state.toString());
        res.redirect(authorizeURL);
    });
});

/**
 * Exchanges a given Spotify auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token is sent back in a JSONP callback function with function name defined by the
 * 'callback' query parameter.
 */
exports.token = functions.https.onRequest((req, res) => {
    try {
        cookieParser()(req, res, () => {
            // console.log('Received verification state:', req.cookies.state);
            // console.log('Received state:', req.query.state);
            /*
            // TODO: add these back!
            if (!req.cookies.state) {
                throw new Error('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
            } // else if (req.cookies.state !== req.query.state) {
                // throw new Error('State validation failed');
            }
            */
            if (req.query.redirect_uri) {
                Spotify.setRedirectURI(req.query.redirect_uri);
                console.log(`redirecting to ${req.query.redirect_uri}`);
            }

            console.log('Received auth code:', req.query.code);

            Spotify.authorizationCodeGrant(req.query.code, (error, data) => {
                if (error) {
                    throw error;
                }
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);
                Spotify.setAccessToken(data.body['access_token']);

                Spotify.getMe(async (error, userResults) => {
                    if (error) {
                        throw error;
                    }
                    // console.log('Auth code exchange result received:', userResults);
                    // We have a Spotify access token and the user identity now.
                    const accessToken = data.body['access_token'];
                    const refreshToken = data.body['refresh_token'];
                    const spotifyUserID = userResults.body['id'];
                    const profilePic = userResults.body['images'] && userResults.body['images'][0] && userResults.body['images'][0]['url'];
                    const userName = userResults.body['display_name'];
                    const email = userResults.body['email'];

                    // Create a Firebase account and get the Custom Auth Token.
                    const firebaseToken = await createFirebaseAccount(spotifyUserID, userName, profilePic, email, accessToken, refreshToken);
                    // Serve an HTML page that signs the user in and updates the user profile.
                    // res.json({token: firebaseToken});
                    res.jsonp({token: firebaseToken});
                });
            });
        });
    } catch (error) {
        return res.jsonp({error: error.toString});
    }
    return null;
});

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /spotifyAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
async function createFirebaseAccount(spotifyID, displayName, photoURL, email, accessToken, refreshToken) {

    // Create or update the user account.
    const userCreationTask = admin.auth().createUser({
        displayName,
        photoURL,
        email,
        emailVerified: true,
    })
    .then(userRecord => userRecord.uid)
    .catch((error) => {
        if (error.code === 'auth/email-already-exists') {
            return admin.auth().getUserByEmail(email).then(userRecord => userRecord.uid);
        }
        throw error;
    });

    // Wait for all async tasks to complete, then generate and return a custom auth token.
    const token_uid = await userCreationTask;

    // Save the access token to the Firebase Realtime Database.
    await admin.database().ref().update({
        [`users/${token_uid}/spotifyUid`]: spotifyID,
        [`/spotifyAccessToken/${token_uid}`]: { token: accessToken, expires: Date.now() + 1000*60*55 },
        [`/spotifyRefreshToken/${token_uid}`]: refreshToken,
        [`/spotifyUid/${token_uid}`]: spotifyID,
        [`/spotifyUidToUid/${spotifyID}`]: token_uid,
    });

    // Create a Firebase custom auth token.
    const token = await admin.auth().createCustomToken(token_uid);
    console.log('Created Custom token for UID "', token_uid, '" Token:', token);
    return token;
}

exports.spotifyPlayerHtml = functions.https.onRequest((req, res) => {
    res.status(200).send(`<!DOCTYPE html>
    <html>
    <head>
      <title>Spotify Web Playback SDK</title>
    </head>
    <body style="margin:0px;padding:0px;overflow:hidden">
      <script>
        // define a new console
        var console=(function(oldCons){
            return {
                log: function(text){
                    oldCons.log(text);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ console: { log: text }}));
                },
                info: function (text) {
                    oldCons.info(text);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ console: { info: text }}));
                },
                warn: function (text) {
                    oldCons.warn(text);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ console: { warn: text }}));
                },
                error: function (text) {
                    oldCons.error(text);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ console: { error: text }}));
                }
            };
        }(window.console));

        //Then redefine the old console
        window.console = console;
      </script>
      <script src="https://sdk.scdn.co/spotify-player.js"></script>
      <script>

        console.log('loading spotify-player.js');

        window.onSpotifyWebPlaybackSDKReady = function() {
            console.log("window.onSpotifyWebPlaybackSDKReady");
        }

        const sendEvent = (event, data={}) => window.ReactNativeWebView.postMessage(JSON.stringify({event, data}));
        const sendError = (error, data={}) => window.ReactNativeWebView.postMessage(JSON.stringify({error, data}));
        const eventForwarder = event => (data={}) => sendEvent(event, data);
        const errorForwarder = error => (data={}) => sendError(error, data);

        document.addEventListener("message", function(message) {

            const iframe = document.querySelector('iframe[src="https://sdk.scdn.co/embedded/index.html"]');
            if (iframe) {
                iframe.style.display = 'block';
                iframe.style.position = 'absolute';
                iframe.frameborder = "0";
                iframe.overflow = "hidden";
                iframe.height = '150%';
                iframe.width = '150%';
                iframe.style.width = '150%';
                iframe.style.height = '150%';
            }

            const token = message.data;
            try {
                window.player = new Spotify.Player({
                    name: 'Web Playback SDK Quick Start Player',
                    getOAuthToken: cb => { cb(token); }
                });

                // errors
                const errors = [
                    'initialization_error',
                    'authentication_error',
                    'account_error',
                    'playback_error',
                ];
                errors.forEach(err => window.player.addListener(err, errorForwarder(err)));

                // events
                const events = [
                    'player_state_changed',
                    'ready',
                    'not_ready',
                ];
                events.forEach(evt => window.player.addListener(evt, eventForwarder(evt)));

                // Connect
                window.player.connect()
                .then(success => {
                    if (success) {
                        sendEvent('connected');
                    } else {
                        sendError('connection_failed');
                    }
                });
            } catch(err) {
                console.error(err);
            }
        });
      </script>
    </body>
    </html>`);
});