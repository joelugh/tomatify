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
        fontSize:50,
        lineHeight:1.5,
    },
}));

export default function ChooseName({onNext, onBack, state: [name, setName]}) {
    const classes = useStyles();

    const isValid = name && name.length && name.length > 0;

    return <>
        <div className={classes.root}>
            <div className={classes.subheader}>
                <Button onClick={() => onBack()}>Back</Button>
                {isValid && <Button color="primary" variant="contained" onClick={() => onNext()}>Finish</Button>}
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
                        label="Enter a name"
                        multiline
                        fullWidth
                        value={name}
                        InputProps={{
                            classes: {
                                input: classes.resize,
                            },
                        }}
                        onChange={event => {
                            let newName = event.target.value
                            if (!newName) {
                                setName("");
                                return;
                            }
                            if (newName.length > 100) return;
                            newName = newName.replace(/(\r\n|\n|\r)/gm,"");
                            setName(newName);
                        }}
                    />
                </div>
            </div>
        </div>
    </>
}