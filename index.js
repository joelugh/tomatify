/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */

const axios = require('axios');
const querystring = require('querystring');

const config = require('./config');

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