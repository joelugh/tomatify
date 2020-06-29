import React from 'react';

import { TextField, Chip, List, ListItem, makeStyles, Divider, Typography, ListSubheader, ListItemIcon, Checkbox, Button, Dialog } from '@material-ui/core';

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
        width: '100%'
    },
    resize:{
        fontSize:30,
        lineHeight:1.5,
    },
}));

export default function ChooseDescription({state: [description, setDescription], onNext, onBack}) {
    const classes = useStyles();
    const isValid = description && description.length && description.length > 0;
    return <>
        <div className={classes.root}>
            <div className={classes.subheader}>
                {<Button onClick={() => onBack()}>Back</Button>}
                {isValid && <Button onClick={() => onNext()}>Next</Button>}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '50vh',
            }}>
                <div style={{width:'80%'}}>
                    <TextField
                        id="standard-multiline-flexible"
                        label="Caption it"
                        multiline
                        fullWidth
                        value={description}
                        InputProps={{
                            classes: {
                                input: classes.resize,
                            },
                        }}
                        onChange={event => {
                            let newDescription = event.target.value
                            if (!newDescription) {
                                setDescription("");
                                return;
                            }
                            if (newDescription.length > 300) return;
                            newDescription = newDescription.replace(/(\r\n|\n|\r)/gm,"");
                            setDescription(newDescription);
                        }}
                    />
                </div>
            </div>
        </div>
    </>
}