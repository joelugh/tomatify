import React from 'react';
import {connect} from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

import Typography from '@material-ui/core/Typography';

import PomList from '../PomList';

import InfiniteScroll from 'react-infinite-scroller';
import { Emoji } from 'emoji-mart';

import Loading from '../Loading';
import Router from 'next/router';
import { IconButton } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import ShareButton from '../ShareButton';


const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;
const LOAD_DELAY_MS = 1000;

function TagView(props) {

    const {
        popular = {},
        id,
        poms,
        profile
    } = props;

    const [loaded, setLoaded] = React.useState(true);
    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const headingComponent = <>
        <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}><Emoji native emoji={id} size={40}/></Typography>
    </>;

    if (!loaded || !isLoaded(poms)) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }

    const subheaderText = <div style={{paddingRight:5}}><Emoji native emoji={id} size={14}/></div>;

    const showSaved = !!!(profile && profile.isEmpty);

    let pomIds = (popular && popular.map && popular.map(o => o.id)) || [];
    if (poms) {
        if (pomIds) pomIds = pomIds.filter(id => poms[id]);
    }

    const listProps = {
        favourites: (profile && profile.saved) || {},
        remainingSyncs: (profile && profile.syncs && profile.syncs.count) || 0,
        pomIds: pomIds.slice(0, numLoaded),
        total: pomIds.length,
        showSaved,
        subheaderText,
    };

    return <>
            <div style={{
                position: 'absolute',
                top: 75,
                left: 10,
            }}>
                <IconButton onClick={() => Router.back()}>
                    <KeyboardBackspaceIcon/>
                </IconButton>
            </div>
            <div style={{
                position: 'absolute',
                top: 75,
                right: 10,
            }}>
                <ShareButton name={id} />
            </div>
            {headingComponent}
            {popular &&
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    setNumLoaded(numLoaded => numLoaded + INC_NUM_LOAD);
                }}
                hasMore={numLoaded < pomIds.length}
                loader={<div className="loader" style={{display:'flex', justifyContent: 'center', width: '100%', padding: '20px 20px 30px 20px'}} key={0}>Loading ...</div>}
                style={{width:'100%', display:'flex', flexDirection: 'column', alignItems:'center'}}
            >
                <PomList {...listProps}/>
            </InfiniteScroll>}
    </>;
}

export default compose(
    firebaseConnect(props => ([
        'popular',
        `tags/${props.id}`,
    ])),
    connect((state, _props) => ({
        popular: state.firebase.data.popular && state.firebase.data.popular.all,
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        poms: state.firebase.data.tags && state.firebase.data.tags[_props.id],
    }),
    dispatch => bindActionCreators({}, dispatch)
    )
)(TagView);