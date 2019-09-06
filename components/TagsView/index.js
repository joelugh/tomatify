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

import Random from '../Random';

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
    const [toggle, setToggle] = React.useState(true);

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

    const headingComponent = <>
        <div style={{display:'flex'}}>
            <div onClick={() => setToggle(true)} style={{marginLeft: 10, marginRight: 10, color: toggle ? 'black' : 'lightgrey', userSelect: 'none'}}>
                <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                    Pick
                </Typography>
            </div>
            <div onClick={() => setToggle(false)} style={{marginLeft: 10, marginRight: 10, color: !toggle ? 'black' : 'lightgrey', userSelect: 'none'}}>
                <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                    Browse
                </Typography>
            </div>
        </div>
    </>

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
        {toggle && <div style={{maxWidth: 460, minWidth: 320, display:'flex',flexWrap:'wrap', justifyContent:'center', padding: '10px 20px 50px 20px'}}>
            {Object.keys(tags).map(tag => <div style={{margin:5}}>
                <Link key={tag} href="/tags/[id]" as={`/tags/${tag}`}>
                    <Chip
                        size="medium"
                        variant="outlined"
                        label={<span style={{fontSize:12}}><Emoji native emoji={tag} size={14} />{Object.keys(tags[tag]).length > 1 ? ` ${Object.keys(tags[tag]).length}` : ""}</span>}
                    />
                </Link>
            </div>)}
        </div>}
        {!toggle && <InfiniteScroll
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
                            <Button style={{display: 'flex', alignItems: 'flex-end'}}>
                                <Emoji native emoji={tag} size={16} />
                                <Typography variant="caption" style={{paddingLeft:5}}>({Object.keys(tags[tag]).length})</Typography>
                            </Button>
                        </Link>
                        <Random pomIds={Object.keys(tags[tag])}/>
                    </ListItem>
                })}
            </List>
        </InfiniteScroll>}
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