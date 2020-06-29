import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import Divider  from '@material-ui/core/Divider';


import Pom from './Pom';

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 500,
        minWidth: 320,
        backgroundColor: theme.palette.background.paper,
    },
    subheader: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingRight: 0,
    },
    toggle: {
        height: 40,
        minWidth: 40,
    }
});

function PomList({
    classes,
    pomIds,
    total,
    canEdit,
    showDelete,
    showSaved,
    subheaderText,
    favourites={},
    remainingSyncs,
    onDelete,
    onToggleType: _onToggleType,
    onSync,
}) {
    const onToggleType = _onToggleType ? _onToggleType : () => {};
    return <List
        className={classes.root}
        subheader={
            <ListSubheader className={classes.subheader}>
                {_onToggleType && <div style={{display: 'flex', alignItems:'center'}}><Button style={{padding: 1, marginRight: 5, minWidth:'0px'}} onClick={onToggleType}>{subheaderText}</Button> Poms ({total})</div>}
                {!_onToggleType && <div style={{display: 'flex', alignItems:'center'}}>{subheaderText}<> Poms ({total})</></div>}
            </ListSubheader>
        }
    >
        {pomIds.map((id, idx) => {
            const isFavourite = favourites[id];
            return <React.Fragment key={id}>
                <Pom
                    id={id}
                    canEdit={canEdit}
                    isFavourite={isFavourite}
                    onDelete={() => onDelete(id)}
                    remainingSyncs={remainingSyncs}
                    showSync={showDelete}
                    showDelete={showDelete}
                    showSaved={showSaved}
                />
                {idx !== pomIds.length-1 && <Divider/>}
            </React.Fragment>
        })}
    </List>
}

PomList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PomList);