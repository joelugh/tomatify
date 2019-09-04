import React from 'react';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import HomeIcon from '@material-ui/icons/Home';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TagFacesIcon from '@material-ui/icons/TagFaces';

import { setFilter } from '../redux/client';

const styles = {
    container: {
        boxShadow: '0px 1px 2px grey',
        backgroundColor: '#ffffff',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        display:'flex',
        justifyContent: 'center',
        zIndex: 1,
    },
    root: {
        width: 360,
    },
};

function LabelBottomNavigation(props) {

    const { classes, filter, setFilter } = props;

    const router = useRouter();

    React.useEffect(() => {
        console.log(router.route)
        if (router.route === "/") {
            if (filter !== "home") setFilter("home");
        } else if (router.route.indexOf("/tags") === 0) {
            if (filter !== "tags") setFilter("tags");
        } else if (router.route === "/library") {
            if (filter !== "uploads") setFilter("uploads");
        } else if (router.route === "/library/liked") {
            if (filter !== "uploads") setFilter("uploads");
        } else {
            if (filter !== "home") setFilter("home");
        }
    }, [router.route])

    const handleChange = (event, value) => {
        props.setFilter(value);
    };

    const WrappedLink = React.forwardRef((props, ref) => <Link href={props.href} as={props.as}><div {...props}></div></Link>);

    return <div className={classes.container}>
        <BottomNavigation value={filter} onChange={handleChange} className={classes.root}>
            <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} component={WrappedLink} href="/"/>
            <BottomNavigationAction label="Tags" value="tags" icon={<TagFacesIcon />}  component={WrappedLink} href="/tags" />
            <BottomNavigationAction label="Library" value="uploads" icon={<AccountCircleIcon />}  component={WrappedLink} href="/library"/>
        </BottomNavigation>
    </div>;
}

LabelBottomNavigation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(
    compose(
        firebaseConnect(props => ([
        ])),
        connect((state, _props) => ({
            filter: state.client.filter,
        }),
        dispatch => bindActionCreators({setFilter}, dispatch)
        )
    )(LabelBottomNavigation)
);