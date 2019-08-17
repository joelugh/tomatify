import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import axios from 'axios';
import * as firebase from "firebase/app";

import Header from './Header';
import Add from './Add';
import Poms from './Poms';
import Loading from './Loading';
import BottomNav from './BottomNav';
import Hero from './Hero';

import config from '../config';
import { getAuth, getDB } from '../db';

var firebaseui = null;

if (global.window) firebaseui = require('firebaseui');

class Home extends React.Component {

    state = {
        pending: true,
        loadingPoms: true,
        filter: 'recents',
    };

    componentDidUpdate(){
        if (this.state.pending) {
            if (isLoaded(this.props.recent) && isLoaded(this.props.popular)) {
                this.setState({pending:false});
            }
        }
    }

    componentDidMount() {
        // Initialize Firebase
        if (this.state.pending) {
            if (isLoaded(this.props.recent) && isLoaded(this.props.popular)) {
                this.setState({pending:false});
            }
        }

        // FirebaseUI config.
        const uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: () => this.setState({pending: true}),
                uiShown: () => this.setState({pending: false}),
            },
            signInSuccessUrl: '/',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
        };

        getAuth().onAuthStateChanged(_user => {
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

            } else {
                if (!firebaseui) return;
                let ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(getAuth());
                ui.start('#firebaseui-auth-container', uiConfig);
            }
        });

    }

    handleAdd = (playlist) => {
        const {
            uri,
            name: title,
        } = playlist;
        const {user} = this.props;
        const userName = user.name;
        const userId = user.id;
        const duration = playlist.tracks.items.map(t => t.track.duration_ms).reduce((a,b) => a + b, 0)/1000;
        const pomRef = firebase.database().ref(`pom/${uri}`);
        pomRef.set({
            uri,
            title,
            duration,
            userId,
            userName,
            createTime: firebase.database.ServerValue.TIMESTAMP,
            spotify: playlist,
        });
        firebase.database().ref(`users/${userId}/poms/${uri}`).set(1);
    }

    handleToggleSaved = (id) => {
        const {user} = this.props;
        const savedPomRef = firebase.database().ref(`users/${user.id}/saved/${id}`);
        savedPomRef.transaction(isSaved => isSaved ? null : 1);
    }

    handleClick = (id) => {
        const pomRef = firebase.database().ref(`clicks/${id}`);
        pomRef.transaction(currentClicks => (currentClicks || 0) + 1);
        document.location.href = id;
    }

    handleDelete = (uri) => {
        const {user={}} = this.props;
        const {id} = user;
        if (!id) return;
        firebase.database().ref(`pom/${uri}`).remove();
        firebase.database().ref(`users/${user.id}/poms/${uri}`).remove();
    }

    handleSync = (_id) => {
        const {user} = this.props;
        const id = _id.split(':').pop()
        const syncCountRef = firebase.database().ref(`users/${user.id}/syncs/count`);
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
            const pomRef = firebase.database().ref(`pom/${_id}`);
            pomRef.transaction(pom => ({
                ...pom,
                uri,
                title,
                duration,
                spotify: response.data,
            }));
        }).catch(err => console.log(err))

    }

    render() {

        const {pending: isPending, loadingPoms, filter} = this.state;
        let {recent = {}, popular = {}, user, tags, tag} = this.props;

        const isUser = user != null && !user.isEmpty && !isPending;

        if (recent && recent["all"] && tags && tags[tag]) {
            // need to give recent a new ref
            recent = {
                ...recent,
                all: recent["all"].filter(id => tags[tag][id])
            }
        }

        return <>
            <Header
                user={user}
                onSignOut={() => getAuth().signOut()}
            />
            <div
                id="container"
                style={{
                    paddingTop: 40,
                    paddingBottom: 50,
                    width:'100%',
                    minHeight:'90vh',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Hero />
                <div id="firebaseui-auth-container"></div>
                {isPending && <Loading />}
                {isUser && <Add
                    userName={(user && user.name) || "No one"}
                    onAdd={this.handleAdd}
                />}
                {!isPending && <>
                    <Poms
                        recent={recent}
                        popular={popular}
                        user={user}
                        onSync={this.handleSync}
                        onClick={this.handleClick}
                        onToggleSaved={this.handleToggleSaved}
                        onDelete={this.handleDelete}
                        filter={filter}
                    />
                </>}
            </div>
            {isUser && <BottomNav
                value={filter}
                onChange={filter => {
                    window.scrollTo(0,0);
                    setTimeout(() => {
                        this.setState({filter})
                    },0)
                }}
            />}
        </>;

    }
}

export default compose(
    firebaseConnect(props => ([
        'popular',
        'recent',
        'tags',
    ])),
    connect((state, _props) => ({
        popular: state.firebase.data.popular,
        recent: state.firebase.data.recent,
        auth: state.firebase.auth,
        user: state.firebase.profile,
        tags: state.firebase.data.tags,
        tag: state.client.tag,
    }))
)(Home);