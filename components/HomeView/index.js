import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

import Landing from '../Landing';
import Poms from '../Poms';

function Home({
    recent = {}, popular = {}, user, filter, auth, initialised,
}) {
    const isUser = user != null && isLoaded(auth) && !isEmpty(auth);
    const [isLanding, setIsLanding] = React.useState(true);

    React.useEffect(() => {
        if (isUser) setIsLanding(false);
    });

    if (isLanding) return <Landing goToHome={() => setIsLanding(false)}/>;

    return <Poms
        recent={recent}
        popular={popular}
        user={isUser && user}
        filter={filter}
    />

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
        filter: state.client.filter,
        initialised: state.client.initialised,
    }))
)(Home);