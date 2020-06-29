import React from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';

import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { Dialog, Chip } from '@material-ui/core';

import { getDB } from '../../db';
import Link from 'next/link';
import Picker from './Picker';

export const special = {
    "fire": true,
    "cd": true,
    "microphone": true,
    "hatching_chick": true,
    "100": true,
}

function Tags(props) {
    /*
    To improve performance, connect to Firebase in the parent component with,

    useFirebaseConnect([`tagsById/${id}`])

    */

    const {
        id,
        addButton = false,
        deleteButton = false,
    } = props;

    const tags = useSelector(state => id && state.firebase.data.tagsById && state.firebase.data.tagsById[id])

    const onClickTag = (e,tag) => {
        e.stopPropagation();
    }

    const [open, setOpen] = React.useState(false);

    const canAdd = addButton && (!tags || Object.keys(tags).filter(tag=>!special[tag]).length < 3);

    if (!canAdd && (!tags || Object.keys(tags).length === 0)) return null;

    const specialTags = !tags ? [] : Object.keys(tags).filter(tag=>special[tag]);
    const otherTags = !tags ? [] : Object.keys(tags).filter(tag=>!special[tag]);

    return (
        <>
            {canAdd && <Dialog
                onClose={e => {
                    e.stopPropagation();
                    setOpen(false)
                }}
                aria-labelledby="simple-dialog-title"
                open={open}
            >
                <div onClick={e => e.stopPropagation()}>
                    <Picker onSelect={tag => {
                        setOpen(false)
                        const db = getDB();
                        db.ref(`tags/${tag.id}/${id}`).set(true);
                        db.ref(`tagsById/${id}/${tag.id}`).set(true);
                    }} />
                </div>
            </Dialog>}
            <>
                {/* {specialTags.map(tag => tags[tag] && <Link key={tag} href="/tags/[id]" as={`/tags/${tag}`}>
                    <Chip
                        size="small"
                        variant="outlined"
                        label={<span style={{fontSize:12}}><Emoji native emoji={tag} size={11} /></span>}
                        onClick={e => onClickTag(e,tag)}
                    />
                </Link>)} */}
                {otherTags.map(tag => tags[tag] && <Link key={tag} href="/tags/[id]" as={`/tags/${tag}`}>
                    <Chip
                        style={{marginRight:2,marginTop:2}}
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
                    />
                </Link>)}
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

export default Tags;