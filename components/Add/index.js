import React from 'react';
import Button from '@material-ui/core/Button';
import Link from 'next/link';

function AddButton({
    userName = '',
    ...otherProps
}) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <Link href="/create" as={`/create`}>
            <Button
                variant="contained"
                color="primary"
                style={{margin: 15}}
            >
                Add Pomodoro Playlist
            </Button>
            </Link>
        </div>
    );
}

export default AddButton;