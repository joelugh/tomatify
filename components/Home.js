import React from 'react';
import axios from 'axios';
import * as firebase from "firebase/app";

import "firebase/auth";
import "firebase/database";

import Header from './Header';
import Add from './Add';
import Poms from './Poms';
import Loading from './Loading';
import BottomNav from './BottomNav';

import { selectPomData } from '../utils';

import config from '../config';

var firebaseui = null;

if (global.window) firebaseui = require('firebaseui');

class Home extends React.Component {

    state = {
        user: null,
        poms: {},
        pending: true,
        loadingPoms: true,
        filter: 'recents',
    };

    componentDidMount() {
        // Initialize Firebase
        try {
            firebase.initializeApp(config.firebaseConfig);
        } catch(err) {}

        let pomsRef = firebase.database().ref('pom');
        pomsRef.on('value', snapshot => {
            const poms = snapshot.val();
            this.setState({poms, loadingPoms:false});
        });

        // FirebaseUI config.
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: () => this.setState({pending: true}),
                uiShown: () => this.setState({pending: false}),
            },
            signInSuccessUrl: '/',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
        };

        firebase.auth().onAuthStateChanged(_user => {
            if (_user) {
                const user = {
                    id: _user.uid,
                    name: _user.displayName,
                    email: _user.email,
                    emailVerified: _user.emailVerified,
                    photo: _user.photoURL,
                    created: _user.metadata.creationTime,
                    last: _user.metadata.lastSignInTime,
                }
                const userRef = firebase.database().ref(`users/${user.id}`);
                userRef.on('value', snapshot => {
                    const user = snapshot.val();
                    this.setState({user});
                });
                userRef.transaction(userData => {
                    return {
                        ...(userData || {}),
                        ...user,
                    }
                });
                this.setState({pending:false})
            } else {
                this.setState({user: null});
                if (!firebaseui) return;
                let ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
                ui.start('#firebaseui-auth-container', uiConfig);
            }
        });

    }

    handleAdd = (playlist) => {
        const {
            uri,
            name: title,
        } = playlist;
        const {user} = this.state;
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
    }

    handleToggleSaved = (id) => {
        const {user} = this.state;
        const savedPomRef = firebase.database().ref(`users/${user.id}/saved/${id}`);
        savedPomRef.transaction(isSaved => isSaved ? null : 1,
            (err, success, snapshot) => {
                if (success) this.setState(state => ({
                    ...state,
                    user : {
                        ...user,
                        saved : {
                            ...user.saved,
                            [id]: snapshot.val(),
                        }
                    }
                }))
            }
        );
    }

    handleClick = (id) => {
        const pom = this.state.poms[id];
        const pomRef = firebase.database().ref(`pom/${id}/clicks`);
        pomRef.transaction(currentClicks => (currentClicks || 0) + 1);
        document.location.href = pom.uri;
    }

    handleDelete = (uri) => {
        const pomRef = firebase.database().ref(`pom/${uri}`);
        pomRef.remove();
    }

    handleRefresh = (_id) => {
        const id = _id.split(':').pop()
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

        const {poms: _poms = {}, user, pending, loadingPoms, filter} = this.state;

        // Sort and filter poms
        let poms = Object.keys(_poms)
            .sort((a,b) => _poms[b].createTime - _poms[a].createTime)
            .map(k => ({ ...selectPomData(_poms[k]), id: k}));

        if (user) {
            if (poms && filter === "uploads") poms = poms.filter(pom => pom.userId === user.id);
            if (poms && filter === "saved") poms = poms.filter(pom => user.saved && user.saved[pom.id]);
        }

        const isPending = pending || (user && !poms);
        const isLoaded = user != null && !isPending;
        const loadedPoms = !!!loadingPoms;

        return <React.Fragment>
            <Header
                user={user}
                onSignOut={() => {
                    this.setState({
                        user: null,
                        pending: true,
                    })
                    firebase.auth().signOut();
                }}
            />
            <div
                id="container"
                style={{
                    paddingTop: '50px',
                    paddingBottom: '50px',
                    width:'100%',
                    minHeight:'90vh',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div id="firebaseui-auth-container"></div>
                {isPending && <Loading />}
                {isLoaded && <Add
                    userName={(user && user.name) || "No one"}
                    onAdd={this.handleAdd}
                />}
                {loadedPoms && poms && <Poms
                    poms={poms}
                    user={user}
                    onRefresh={this.handleRefresh}
                    onClick={this.handleClick}
                    onToggleSaved={this.handleToggleSaved}
                    onDelete={this.handleDelete}
                    filter={filter}
                />}
            </div>
            {user && <BottomNav
                value={filter}
                onChange={filter => this.setState({filter})}
            />}
        </React.Fragment>;

    }
}

export default Home;