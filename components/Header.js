import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { getAuth, GoogleProvider } from '../db';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    logo: {
        height: 50,
        width: 50,
        marginRight: 15,
    },
};

function Header(props) {

    const {
        user,
        auth,
        initialised,
        classes,
    } = props;

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                <img src="/static/logo100.png" className={classes.logo} />
                <Typography variant="h6" color="inherit" className={classes.grow}>
                    Tomatify
                </Typography>
                {initialised && isLoaded(auth) && !isEmpty(auth) && <Button
                    id="sign-out"
                    color="inherit"
                    onClick={() => getAuth().signOut()}
                    >Sign Out</Button>
                }
                {initialised && isLoaded(auth) && isEmpty(auth) && <>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={() => {
                            getAuth().signInWithPopup(GoogleProvider).then(function(result) {
                                // This gives you a Google Access Token. You can use it to access the Google API.
                                var token = result.credential.accessToken;
                                // The signed-in user info.
                                var user = result.user;
                                // ...
                            }).catch(function(error) {
                                // Handle Errors here.
                                var errorCode = error.code;
                                var errorMessage = error.message;
                                // The email of the user's account used.
                                var email = error.email;
                                // The firebase.auth.AuthCredential type that was used.
                                var credential = error.credential;
                                // ...
                            });
                        }}
                    >Sign In</Button>
                </>}
                </Toolbar>
            </AppBar>
        </div>
    );
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

const connectedHeader = compose(
    connect((state) => ({
        auth: state.firebase.auth,
        user: state.firebase.profile,
        initialised: state.client.initialised,
    }))
)(Header);

export default withStyles(styles)(connectedHeader);