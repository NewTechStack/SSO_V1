import React from 'react';
import {
    Router,
    Switch,
    Route, Redirect,
} from 'react-router-dom';
import Info from "./infos";
import Admin from "./admin";
import Pro from "./pro"
import RegistreDetails from "./registreDetails";
import RegistriesLogs from "./registriesLogs";

export default function Routes() {
    return (

            <Switch>
                {/*<Route exact path="/main/dash" component={Dashboard} />*/}
                <Redirect exact from={"/main"} to={"/main/infos"} />
                <Route exact path="/main/infos" component={Info} />
                <Route exact path="/main/admin" component={Admin} />
                <Route path="/main/registres"
                       render={routeProps => <Pro {...routeProps}/>}
                />
                <Route exact path="/main/pro/registre/:reg" component={RegistreDetails} />
                <Route exact path="/main/pro/registres/logs" component={RegistriesLogs} />
            </Switch>

    );
}
