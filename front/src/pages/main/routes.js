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

export default function Routes() {
    return (

            <Switch>
                {/*<Route exact path="/main/dash" component={Dashboard} />*/}
                <Redirect exact from={"/main"} to={"/main/infos"} />
                <Route exact path="/main/infos" component={Info} />
                <Route exact path="/main/admin" component={Admin} />
                <Route exact path="/main/registres" component={Pro} />
                <Route exact path="/main/pro/registre/:reg" component={RegistreDetails} />
            </Switch>

    );
}
