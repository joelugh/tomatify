import React from 'react';
import { useSelector } from 'react-redux'
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

function Header({
    classes,
}) {

    const auth = useSelector(state => state.firebase.auth);
    const user = useSelector(state => state.firebase.profile);
    const initialised = useSelector(state => state.client.initialised);

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
                </Toolbar>
            </AppBar>
        </div>
    );
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);