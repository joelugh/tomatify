import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import { Emoji, Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { Dialog, Chip } from '@material-ui/core';
import { setTag } from '../redux/client';

import { getDB } from '../db';

const styles = theme => ({
    tags: {
        // display: 'flex',
        // position: 'absolute',
    }
});

function Tags(props) {

    const {
        classes,
        id,
        addButton = false,
        deleteButton = false,
        tags = {},
        setTag = () => {},
    } = props;

    const onClickTag = (e,tag) => {
        e.stopPropagation();
        setTag(tag);
    }

    const [open, setOpen] = React.useState(false);

    const special = {
        "fire": true,
        "cd": true,
        "microphone": true,
        "hatching_chick": true,
        "100": true,
    }

    const reserved = {
        "Fire": true,
        "Optical Disc": true,
        "Microphone": true,
        "Hundred Points Symbol": true,
        "First Place Medal": true,
        "Second Place Medal": true,
        "Third Place Medal": true,
        "Hatching Chick": true,
        "High Voltage Sign": true,
        "Tomato": true,
    }



    const canAdd = addButton && (!tags || Object.keys(tags).filter(tag=>!special[tag]).length < 3);

    if (!canAdd && (!tags || Object.keys(tags).length === 0)) return null;

    const specialTags = !tags ? [] : Object.keys(tags).filter(tag=>special[tag]);
    const otherTags = !tags ? [] : Object.keys(tags).filter(tag=>!special[tag]);

    return (
        <>
            {canAdd && <Dialog onClose={e => {
                e.stopPropagation();
                setOpen(false)
            }} aria-labelledby="simple-dialog-title" open={open}>
                {/* <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle> */}
                <Picker
                    onSelect={tag => {
                        setOpen(false)
                        const db = getDB();
                        db.ref(`tags/${tag.id}/${id}`).set(true);
                        db.ref(`tagsById/${id}/${tag.id}`).set(true);
                    }}
                    recent={["the_horns","saxophone","musical_keyboard","coffee","popcorn","musical_score"]}
                    emojisToShowFilter={emoji => {
                    return !!!reserved[emoji.name];
                    }}
                    title={"Pom Tags"}
                    emoji={"tomato"}
                    notFoundEmoji={"tomato"}
                    showSkinTones={false}
                />
            </Dialog>}
            <>
                {specialTags.map(tag => tags[tag] && <Chip
                    key={tag}
                    size="small"
                    variant="outlined"
                    label={<span style={{fontSize:12}}><Emoji native emoji={tag} size={11} /></span>}
                    onClick={e => onClickTag(e,tag)}
                />)}
                {otherTags.map(tag => tags[tag] && <Chip
                    key={tag}
                    size="small"
                    variant="outlined"
                    label={<span style={{fontSize:12}}><Emoji native emoji={tag} size={11} /></span>}
                    onClick={e => onClickTag(e,tag)}
                    onDelete={!deleteButton ? null : () => {
                        const db = getDB();
                        db.ref(`tags/${tag}/${id}`).remove();
                        db.ref(`tagsById/${id}/${tag}`).remove();
                    }}
                />)}
                {canAdd && <Chip
                    size="small"
                    variant="outlined"
                    label={<span style={{fontSize:12}}>+</span>}
                    onClick={e => {
                        e.stopPropagation();
                        setOpen(true)
                    }}
                    // onDelete={() => {}}
                />}
            </>
        </>
    );
}

Tags.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const ConnectedTags = compose(
    firebaseConnect(props => ([
        `tagsById/${props.id}`
    ])),
    connect((state, _props) => ({
        tags: _props.id && state.firebase.data.tagsById && state.firebase.data.tagsById[_props.id],
    }),
    dispatch => bindActionCreators({setTag}, dispatch)
    ),
)(Tags);

export default withStyles(styles, { withTheme: true })(ConnectedTags);