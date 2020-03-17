import React from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect, isLoaded } from 'react-redux-firebase';
import {Picker} from 'emoji-mart';
import {special} from './index';
import {getDB} from '../../db';

function WrappedPicker({
    id,
    setOpen = () => {},
}) {

    useFirebaseConnect([
        'tags',
    ])

    const tags = useSelector(state => state.firebase.data.tags);

    if (!isLoaded(tags)) return null;

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

    const recent = !tags ? [] : Object.keys(tags)
        .filter(tag => !!!special[tag])
        .sort((a,b) => Object.keys(tags[b]).length - Object.keys(tags[a]).length);

    return <Picker
        onSelect={tag => {
            setOpen(false)
            const db = getDB();
            db.ref(`tags/${tag.id}/${id}`).set(true);
            db.ref(`tagsById/${id}/${tag.id}`).set(true);
        }}
        recent={recent}
        emojisToShowFilter={emoji => {
            return !!!reserved[emoji.name];
        }}
        title={"Pom Tags"}
        emoji={"tomato"}
        native={true}
        notFoundEmoji={"tomato"}
        showSkinTones={false}
    />;
}

export default WrappedPicker;