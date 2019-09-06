import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import {
    List,
    ListItem,
    Typography,
    Button,
} from '@material-ui/core';

import InfiniteScroll from 'react-infinite-scroller';

import Random from '../Random';

import { Emoji } from 'emoji-mart';
import Loading from '../Loading';
import Link from 'next/link';

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

    const headingComponent = <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
        Tomatify Tags
    </Typography>

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

    let tagsList = Object.keys(tags).sort((a,b) => Object.keys(tags[b]).length - Object.keys(tags[a]).length).slice(0, numLoaded);

    return <>
        {headingComponent}
        <InfiniteScroll
            pageStart={0}
            loadMore={() => {
                setNumLoaded(numLoaded => numLoaded + INC_NUM_LOAD);
            }}
            hasMore={numLoaded < Object.keys(tags).length}
            loader={<div className="loader" style={{display:'flex', justifyContent: 'center', width: '100%', padding: '20px 20px 30px 20px'}} key={0}>Loading ...</div>}
            style={{width:'100%', display:'flex', flexDirection: 'column', alignItems:'center'}}
            >
            <List style={root}>
                {tagsList.map(tag => {
                    return <ListItem key={tag} style={listItem}>
                        <Link href="/tags/[id]" as={`/tags/${tag}`}>
                            <Button style={{marginLeft: 25, display: 'flex', alignItems: 'flex-end'}}>
                                <Emoji native emoji={tag} size={16} />
                                <Typography variant="caption" style={{paddingLeft:5}}>({Object.keys(tags[tag]).length})</Typography>
                            </Button>
                        </Link>
                        <Random pomIds={Object.keys(tags[tag])}/>
                    </ListItem>
                })}
            </List>
        </InfiniteScroll>
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