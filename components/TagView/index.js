import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import {
    List,
    ListItem,
} from '@material-ui/core';
import Random from '../Random';

import { Emoji } from 'emoji-mart';

function TagView({
    tags = {}
}) {

    const root = {
        width: '100%',
        maxWidth: '500px',
        minWidth: '360px',
        padding: 0,
    };

    const randomProps = {
        pomIds: [],
        onClick: () => {},
        favourites: () => {},
        onToggleSaved: () => {},
    };

    const listItem = {

        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    }

    if (!tags) return null;

    return (
        <List style={root}>
            {Object.keys(tags).sort((a,b) => Object.keys(tags[b]).length - Object.keys(tags[a]).length).map(tag => {
                return <ListItem key={tag} style={listItem}>
                    <div style={{paddingLeft: 25}}>
                        <Emoji native emoji={tag} size={16} />
                    </div>
                    <Random {...randomProps} pomIds={Object.keys(tags[tag])}/>
                </ListItem>
            })}
        </List>
    );

}

const ConnectedTagView = compose(
    firebaseConnect(props => ([
        `tags`,
    ])),
    connect((state, _props) => ({
        tags: state.firebase.data.tags,
    })),
)(TagView);

export default ConnectedTagView;