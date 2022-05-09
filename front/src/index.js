import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import './App.css'
import './assets/css/semantic-ui_clone.css'
import {IconButton} from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#1c94fe',
        },
        secondary: {
            main: '#11cb5f',
        },
        custom: {
            main: '#1c94fe'
        }

    },
});

const notistackRef = React.createRef();

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <SnackbarProvider ref={notistackRef} maxSnack={5} autoHideDuration={5000}
                          /*action={(key) => (
                              <IconButton onClick={(key) => {
                                  notistackRef.current.closeSnackbar(key);
                              }}>
                                  <HighlightOffIcon style={{color:"#fff"}}/>
                              </IconButton>
                          )}*/
        >
            <App/>
        </SnackbarProvider>
    </ThemeProvider>,
    document.getElementById("root"));

serviceWorker.unregister();
