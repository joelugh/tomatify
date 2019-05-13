    import React from 'react';
    import PropTypes from 'prop-types';
    import { withStyles } from '@material-ui/core/styles';
    import Typography from '@material-ui/core/Typography';
    import Table from '@material-ui/core/Table';
    import TableBody from '@material-ui/core/TableBody';
    import TableCell from '@material-ui/core/TableCell';
    import TableHead from '@material-ui/core/TableHead';
    import TableRow from '@material-ui/core/TableRow';
    import Paper from '@material-ui/core/Paper';

    const styles = theme => ({
        root: {
            position: 'relative',
            width: '100%',
            marginTop: theme.spacing.unit * 3,
            overflowX: 'auto',
        },
        table: {
            tableLayout: 'fixed',
        },
        row: {
            height: 0,
            maxWidth: 500,
        },
    });

    function TrackTable(props) {
        const { classes, tracks } = props;

        const widths = ['5%', '70%', '25%'];
        return (
            <Table className={classes.table}>
                <TableHead>
                <TableRow>
                    <TableCell style={{width: widths[0]}} padding="none">#</TableCell>
                    <TableCell style={{width: widths[1]}} align="left" padding="dense">Title</TableCell>
                    <TableCell style={{width: widths[2]}} align="right" padding="dense">Duration</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {tracks.map((track,idx) => (
                    <TableRow key={track.id} className={classes.row}>
                    <TableCell style={{width: widths[0]}} component="th" scope="row" padding="none">{idx + 1}</TableCell>
                    <TableCell
                        align="left"
                        padding="dense"
                        style={{width: widths[1]}}
                    ><Typography component="div" noWrap>{track.title}</Typography></TableCell>
                    <TableCell style={{width: widths[2]}} align="right" padding="dense">{track.duration}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        );
    }

    TrackTable.propTypes = {
    classes: PropTypes.object.isRequired,
    };

    export default withStyles(styles)(TrackTable);