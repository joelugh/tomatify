/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */

// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

const config = require('./config');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(config.firebaseConfig);
// [END import]

const axios = require('axios');
const querystring = require('querystring');

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
    const SAVED_MULTIPLIER = 20;
    const dbRef = admin.database().ref();
    return dbRef.once("value")
    .then(snapshot => {
        const pomScores = {};
        const db = snapshot.val();
        if (db.clicks) Object.keys(db.clicks).forEach(pomId => {
            const clicks = parseInt(db.clicks[pomId],10);
            pomScores[pomId] = pomScores[pomId] ? pomScores[pomId] + clicks : clicks;
        })
        if (db.users) Object.keys(db.users).forEach(userId => {
            const user = db.users[userId];
            if (!user.saved) return;
            Object.keys(user.saved).forEach(pomId => {
                if (db.pom && db.pom[pomId].userId == userId) return;
                pomScores[pomId] = pomScores[pomId] ? pomScores[pomId] + SAVED_MULTIPLIER : SAVED_MULTIPLIER;
            })

        });
        const top = Object.keys(pomScores).map(pomId => [pomId, pomScores[pomId]]).sort((a,b) => b[1]-a[1]).map(o => ({ id: o[0], score: o[1] }));
        const topAll = top.filter(o => db.pom && db.pom[o.id]).slice(0,20);
        const oneMonthMillis = 1000*60*60*24*30;
        const oneWeekMillis = 1000*60*60*24*7;
        const topMonth = top.filter(o => db.pom && Date.now() - db.pom[o.id].createTime < oneMonthMillis).slice(0,20);
        const topWeek = top.filter(o => db.pom && Date.now() - db.pom[o.id].createTime < oneWeekMillis).slice(0,20);
        return Promise.all([
            admin.database().ref("popular/all").set(topAll),
            admin.database().ref("popular/month").set(topMonth),
            admin.database().ref("popular/week").set(topWeek),
            admin.database().ref("popular/lastRun").set(Date.now()),
        ]);
    });
}

exports.calcRecent = functions.https.onRequest(calcRecent);
exports.calcPopular = functions.https.onRequest(calcPopular);
exports.scheduledCalcMostPopular = functions.pubsub.schedule('every 1 hours').onRun(calcPopular);

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.newPomNotify = functions.database.ref('/pom/{pushId}')
.onCreate((snapshot, context) => {

    // Update recent and popular
    calcRecent();
    calcPopular();

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
            return Promise.all(promises);
        });
        Promise.all(promises)
        .then((responses) => {
            console.log(`Successfully sent message for ${original.title}`);
        })
        .catch((error) => {
            console.log(`Error sending message for ${original.title}:`, error);
        });

    });

})

exports.deletePom = functions.database.ref('/pom/{pushId}')
.onDelete((snapshot, context) => {
    // Update recent and popular
    calcRecent();
    calcPopular();
})
// [END makeUppercase]
// [END all]