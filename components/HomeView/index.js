import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFirebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

import { setShowLanding } from '../../redux/client';

import Landing from '../Landing';
import Poms from '../Poms';

function Home(props) {
    useFirebaseConnect([
        'popular',
        'recent',
    ])

    const popular = useSelector(state => state.firebase.data.popular);
    const recent = useSelector(state => state.firebase.data.recent);
    const auth = useSelector(state => state.firebase.auth);
    const user = useSelector(state => state.firebase.profile);
    const filter = useSelector(state => state.client.filter);

    const isUser = user != null && isLoaded(auth) && !isEmpty(auth);

    if (!isUser) return <Landing />;

    return <Poms
        recent={recent}
        popular={popular}
        user={isUser && user}
        filter={filter}
    />

}

export default Home;