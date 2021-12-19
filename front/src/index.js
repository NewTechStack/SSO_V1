import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import './App.css'
import './assets/css/semantic-ui_clone.css'

const theme = createTheme({
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


ReactDOM.render(
    <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={5}>
            <App/>
        </SnackbarProvider>
    </ThemeProvider>,
    document.getElementById("root"));

serviceWorker.unregister();
