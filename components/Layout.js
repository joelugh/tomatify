import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {isLoaded} from 'react-redux-firebase';

import {getAuth} from '../db';
import {setInitialised} from '../redux/client';

import BottomNav from "./BottomNav";
import Header from "./Header";
import Loading from './Loading';

function Layout({
    hideHeader = false,
    hideNav = false,
    children,
}) {

    const initialised = useSelector(state => state.client.initialised);
    const auth = useSelector(state => state.firebase.auth);

    const dispatch = useDispatch();

    React.useEffect(() => {
        if (initialised) return;
        const unsubscribe = getAuth().onAuthStateChanged(() => {
            dispatch(setInitialised(true));
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

export default Layout;
