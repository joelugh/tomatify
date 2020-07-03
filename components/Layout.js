import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {isLoaded, isEmpty} from 'react-redux-firebase';

import {getAuth} from '../db';
import {setInitialised} from '../redux/client';

import BottomNav from "./BottomNav";
import Header from "./Header";
import Loading from './Loading';
import CurrentlyPlaying from './CurrentlyPlaying';

function Layout({
    hideHeader = false,
    hidePlaying = false,
    hideNav = false,
    children,
}) {

    const initialised = useSelector(state => state.client.initialised);
    const auth = useSelector(state => state.firebase.auth);
    const user = useSelector(state => state.firebase.profile);
    const isUser = user != null && isLoaded(auth) && !isEmpty(auth);

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
        {isUser && !hidePlaying && <CurrentlyPlaying />}
        {isUser && !hideNav && <BottomNav />}
        <div style={{
            display:'flex',
            flexDirection: 'column',
            alignItems:'center',
            paddingTop: hideHeader ? 0 : 40,
            paddingBottom: 60 + (hidePlaying?0:80),
        }}>
            {!loaded && <Loading />}
            {loaded && children}
        </div>
    </>;
}

export default Layout;
