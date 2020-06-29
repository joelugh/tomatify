import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import {
    List,
    ListItem,
    Typography,
    Button,
    Chip,
    Badge,
} from '@material-ui/core';

import InfiniteScroll from 'react-infinite-scroller';

import { Emoji } from 'emoji-mart';
import Loading from '../Loading';
import Link from 'next/link';

import { special as specialTags } from '../Tags';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;
const LOAD_DELAY_MS = 1000;


function TagsView({
    tags = {}
}) {

    const [loaded, setLoaded] = React.useState(true);
    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const root = {
        width: '100%',
        maxWidth: '500px',
        minWidth: '320px',
        padding: 0,
    };

    const listItem = {

        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    }

    const headingComponent = <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>Tags</Typography>

    if (!loaded) {
    return <>
        {headingComponent}
        <Loading />
    </>
    }

    if (!tags || !loaded) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }

    const sortedTagsList = Object.keys(tags).sort((a,b) => Object.keys(tags[b]).length - Object.keys(tags[a]).length);
    const tagsList = sortedTagsList.filter(tag => !!!specialTags[tag]).slice(0, numLoaded);

    return <>
        {headingComponent}
        <div style={{maxWidth: 460, minWidth: 320, display:'flex',flexWrap:'wrap', justifyContent:'center', padding: '10px 20px 50px 20px'}}>
            {Object.keys(tags).map(tag => <div key={tag} style={{margin:5}}>
                <Link href="/tags/[id]" as={`/tags/${tag}`}>
                    <Chip
                        size="medium"
                        variant="outlined"
                        label={<span style={{fontSize:12}}><Emoji native emoji={tag} size={14} />{Object.keys(tags[tag]).length > 1 ? ` ${Object.keys(tags[tag]).length}` : ""}</span>}
                    />
                </Link>
            </div>)}
        </div>
    </>;

}

const ConnectedTagsView = compose(
    firebaseConnect(props => ([
        `tags`,
    ])),
    connect((state, _props) => ({
        tags: state.firebase.data.tags,
    })),
)(TagsView);

export default ConnectedTagsView;