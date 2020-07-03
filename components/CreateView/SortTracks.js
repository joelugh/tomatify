import React from 'react';

import {
    SortableContainer,
    SortableElement,
    SortableHandle
} from "react-sortable-hoc";
import arrayMove from "array-move";
import DragHandleIcon from "@material-ui/icons/DragHandle";

import { List, ListItem, makeStyles, Divider, Typography, ListSubheader, ListItemIcon, Checkbox, Button, ListItemSecondaryAction, ListItemText, Paper } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 500,
        minWidth: 320,
        backgroundColor: theme.palette.background.paper,
    },
    subheader: {
        display: 'flex',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
    },
    item: {
        backgroundColor: 'white',
    }
}));

const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <DragHandleIcon />
    </ListItemIcon>
  ));

const SortableItem = SortableElement(({ item, classes }) => <div>
    <ListItem ContainerComponent="div" className={classes.item}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: 'auto',
            }}
        >
            <DragHandle />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 15,
                marginRight: 15,
                width: 'auto',
            }}>
                <Typography variant="subtitle1">{item.track.name}</Typography>
                <Typography variant="subtitle2">{`by ${item.track.artists && item.track.artists[0] && item.track.artists[0].name}`}</Typography>
                <Typography variant="caption">{`${item.track.duration_ms/1000} seconds`}</Typography>

            </div>
        </div>
    </ListItem>
    <Divider />
</div>);

const SortableListContainer = SortableContainer(({ items, subheader, classes }) => (
    <List
        className={classes.root}
        subheader={subheader}
    >
    {items.map((item, index) => (
        <SortableItem key={item.track.id} index={index} item={item} classes={classes} />
    ))}
</List>
));

export default function SortTracks({state:[items=[], setItems], onNext, onBack}) {
    const classes = useStyles();
    const duration_ms = items.reduce((acc,item) => acc += item.track.duration_ms, 0);
    const isValid = duration_ms/1000/60 < 30 && duration_ms/1000/60 > 20;

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setItems(items => arrayMove(items, oldIndex, newIndex));
    };

    return <>
        <SortableListContainer
            items={items}
            onSortEnd={onSortEnd}
            useDragHandle={true}
            lockAxis="y"
            subheader={
                <ListSubheader className={classes.subheader}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <Button onClick={onBack} style={{marginRight:15}}>Back</Button>
                        <Typography>{`Order tracks`}</Typography>
                    </div>
                    {<Button onClick={onNext}>Next</Button>}
                </ListSubheader>
            }
            classes={classes}
        />
    </>
}