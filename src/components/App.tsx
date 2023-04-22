import React from 'react';
import { observer } from 'mobx-react';

import { makeStyles } from '../styles';
import { Theme } from '@mui/material';

import { Switch } from 'react-declarative';

import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CssBaseline from '@mui/material/CssBaseline';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import routes from '../config/routes';

import ioc from '../lib/ioc';

const useStyles = makeStyles()((theme) => ({
  loaderBar: {
    marginBottom: -4,
  },
  content: {
    minHeight: '100vh',
  },
}));

const Fragment = () => <></>;

const App = observer(() => {
  const { classes } = useStyles();

  return (
    <Box>
      {ioc.layoutService.hasAppbarLoader && (
        <Box className={classes.loaderBar}>
          <LinearProgress color="secondary" />
        </Box>
      )}
      <CssBaseline />
      <Box className={classes.content}>
        <Switch
          Loader={Fragment}
          history={ioc.routerService}
          items={routes}
          onLoadStart={() => ioc.layoutService.setAppbarLoader(true)}
          onLoadEnd={() => ioc.layoutService.setAppbarLoader(false)}
          throwError
        />
      </Box>
      {ioc.layoutService.hasModalLoader && (
        <Backdrop
          sx={{
            zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            background: (theme: Theme) => theme.palette.background.paper,
            gap: 3,
          }}
          open={ioc.layoutService.hasModalLoader}
        >
          <CircularProgress />
          <Typography variant="body1">
            Waiting for MetaMask confirmation
          </Typography>
        </Backdrop>
      )}
    </Box>
  );
});

export default App;
