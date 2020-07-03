import React from 'react';

import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import Picker from '../Tags/Picker';
import { Chip, List, ListItem, makeStyles, Divider, Typography, ListSubheader, ListItemIcon, Checkbox, Button, Dialog } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        minHeight: '70vh',
    },
    subheader: {
        display: 'flex',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
    }
}));

// ...((checked.indexOf(tag) !== -1) && {backgroundColor: "#CCCCCC"}),
function Tag({tag, onClick, isChecked, children}) {
    return <div
        style={{
            margin: 10,
            display:'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height:90,
            width:90,
            border: "solid 1px #AAAAAA",
            borderRadius: 45,
            backgroundColor: isChecked ? "#CCCCCC" : "#FFFFFF",
            fontSize: 40,
        }}
        onClick={onClick}
    >
        {!children && <Emoji native emoji={tag} size={40} />}
        {children}
    </div>
}

export default function ChooseTags({state: [checked=[], setChecked], onNext, onBack}) {
    const classes = useStyles();
    const [tags,setTags] = React.useState(["headphones", "guitar", "dark_sunglasses", "musical_keyboard", "saxophone"]);
    const [open, setOpen] = React.useState(false);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        if (newChecked.length > 3) return;
        setChecked(newChecked);
    };

    const isFull = checked.length === 3;
    const isValid = checked.length > 0;

    return <>
        <div className={classes.root}>
            <div className={classes.subheader}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <Button onClick={onBack} style={{marginRight:15}}>Back</Button>
                    <Typography>{`What's the mood?`}</Typography>
                </div>
                {isValid && <Button onClick={() => onNext(checked)}>Next</Button>}
            </div>
            <div style={{
                width: '100%',
                display:'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'center',
                backgroundColor: 'white',
            }}>
                {tags.map(tag => <Tag key={tag} tag={tag} onClick={handleToggle(tag)} isChecked={(checked.indexOf(tag) !== -1)} />)}
                {!isFull && <Tag onClick={() => setOpen(true)}>+</Tag>}
            </div>
        </div>
        <Dialog
            onClose={e => {
                e.stopPropagation();
                setOpen(false)
            }}
            aria-labelledby="simple-dialog-title"
            open={open}
        >
            <div onClick={e => e.stopPropagation()}>
                <Picker
                    onSelect={tag => {
                        setOpen(false);
                        if (tags.indexOf(tag.id) !== -1) return;
                        handleToggle(tag.id)();
                        setTags([...tags, tag.id]);
                    }}
                />
            </div>
        </Dialog>
    </>
}