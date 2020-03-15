import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import blue from '@material-ui/core/colors/blue';
import Add from './Add';

const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
});

function AddDialog({
    onClose,
    selectedValue,
    ...otherProps
}) {

    const handleClose = () => onClose(selectedValue);
    const classes = useStyles();

    return (
        <Dialog onClose={handleClose} aria-labelledby="add-dialog-title" {...otherProps}>
            <DialogTitle id="add-dialog-title">Enter Playlist Details</DialogTitle>
            <Add close={handleClose} />
        </Dialog>
    );
}

AddDialog.propTypes = {
    onClose: PropTypes.func,
    selectedValue: PropTypes.string,
};

export default AddDialog;