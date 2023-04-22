import { makeStyles } from '../styles';
import { Theme, useMediaQuery } from '@mui/material';

import Box from '@mui/material/Box';

import { observer } from 'mobx-react';

import WheelWidget from '../widgets/WheelWidget';
import RecentWidget from '../widgets/RecentWidget';

// import ioc from '../lib/ioc';

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        flexDirection: 'row',
    },
    table: {
        flex: 1,
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chat: {
        background: theme.palette.background.paper,
        minWidth: 512,
    },
    wheel: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
}));

export const MainPage = observer(() => {

    const { classes } = useStyles();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    return (
        <Box className={classes.root}>
            <Box className={classes.container}>
                <Box
                    className={classes.table}
                    sx={{
                        ...(isMobile && {
                            alignItems: 'stretch !important',
                            justifyContent: 'stretch !important',
                        }),
                    }}
                >
                    <Box
                        className={classes.wheel}
                        sx={{
                            ...(isMobile ? {
                                flex: 1,
                            } : {
                                '& > *:nth-of-type(1)': {
                                    marginBottom: '60px',
                                    maxWidth: '680px',
                                }
                            }),
                        }}
                    >
                        <WheelWidget
                            sx={{
                                height: '100%',
                                width: '100%',
                            }}
                        />
                    </Box>
                </Box>
                {!isMobile && (
                    <Box className={classes.chat}>
                        <RecentWidget />
                    </Box>
                )}
            </Box>
        </Box>
    );
});

export default MainPage;