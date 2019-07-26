import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';

import Pom from './Pom';

const styles = theme => ({
    root: {
        width: 'auto',
        maxWidth: '500px',
        minWidth: '360px',
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

class PomList extends React.Component {

    state = {
        expanded: null,
        all: false,
    }

    componentDidUpdate(prevProps) {
        if (this.props.pomIds !== prevProps.pomIds) this.setState({expanded:null});
    }

    handleExpand = idx => this.setState(state => ({
        all: false,
        expanded: state.all ? null : state.expanded === idx ? null : idx,
    }));

    handleToggle = () => this.setState(state => ({
        all: !(state.all || state.expanded !== null),
        expanded: null,
    }));

    render() {

        const {
            expanded,
            all,
        } = this.state;

        const {
            classes,
            pomIds,
            total,
            showDelete,
            showSaved,
            subheaderText,
            favourites,
            remainingSyncs,
            onClick,
            onDelete,
            onToggleSaved,
            onToggleType: _onToggleType,
            onSync,
        } = this.props;

        const unfoldLess = all || expanded !== null;

        const onToggleType = _onToggleType ? _onToggleType : () => {};

        return <List
            className={classes.root}
            subheader={
                <ListSubheader className={classes.subheader}>
                    {_onToggleType && <div style={{display: 'flex', alignItems:'center'}}><Button style={{padding: 1, marginRight: 5, minWidth:'0px'}} onClick={onToggleType}>{subheaderText}</Button> Poms ({total})</div>}
                    {!_onToggleType && <div>{subheaderText} Poms ({total})</div>}
                    <Button className={classes.toggle} onClick={this.handleToggle}>
                        {unfoldLess ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </Button>
                </ListSubheader>
            }
        >
            {pomIds.map((id, idx) => {
                const isFavourite = favourites[id];
                return <Pom
                    key={id}
                    id={id}
                    expanded={all || expanded === idx}
                    handleExpand={() => this.handleExpand(idx)}
                    isFavourite={isFavourite}
                    onClick={() => onClick(id)}
                    onDelete={() => onDelete(id)}
                    onToggleSaved={() => onToggleSaved(id)}
                    onSync={() => onSync(id)}
                    remainingSyncs={remainingSyncs}
                    showSync={showDelete}
                    showDelete={showDelete}
                    showSaved={showSaved}
                    divider={idx !== pomIds.length-1}
                />
            })}
        </List>
    }
}

PomList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PomList);