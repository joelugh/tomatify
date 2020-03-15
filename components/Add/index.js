import React from 'react';
import Button from '@material-ui/core/Button';
import AddDialog from './AddDialog';

function AddButton({
    userName = '',
    ...otherProps
}) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
                style={{margin: 15}}
            >
                Add Pomodoro Playlist
            </Button>
            <AddDialog
                open={open}
                onClose={handleClose}
                {...otherProps}
            />
        </div>
    );
}

export default AddButton;