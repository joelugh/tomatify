import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

import {getAuth} from '../db';
import {setInitialised} from '../redux/client';

import BottomNav from "./BottomNav";
import Header from "./Header";
import Loading from './Loading';

function Layout({
    hideHeader = false,
    hideNav = false,
    initialised,
    auth,
    setInitialised = () => {},
    children,
}) {
    React.useEffect(() => {
        if (initialised) return;
        const unsubscribe = getAuth().onAuthStateChanged(() => {
            setInitialised();
            unsubscribe();
        })
    },[initialised]);

    const loaded = initialised && isLoaded(auth);

    return <>
        {!hideHeader && <Header />}
        {!hideNav && <BottomNav />}
        <div style={{
            display:'flex',
            flexDirection: 'column',
            alignItems:'center',
            paddingTop: 40,
            paddingBottom: 60,
        }}>
            {!loaded && <Loading />}
            {loaded && children}
        </div>
    </>;
}

export default connect(
    (state) => ({
        initialised: state.client.initialised,
        auth: state.firebase.auth,
    }),
    (dispatch) => bindActionCreators({setInitialised: () => setInitialised(true)}, dispatch)
)(Layout);
