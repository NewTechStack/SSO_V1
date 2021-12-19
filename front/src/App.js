import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect,withRouter} from "react-router-dom";
import MuiBackdrop from "./components/Loading/MuiBackdrop";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Main from "./pages/main/main"
import Reset from "./pages/auth/reset"
import Registry from "./pages/auth/registry"
import ResetRequest from "./pages/auth/resetRequest"
import Extern_login from "./pages/auth/extern/extern_login";
import Extern_signup from "./pages/auth/extern/extern_signup";
import Accept_service from "./pages/auth/extern/accept_service";
import moment from "moment";
import 'moment/locale/fr';

export default class App extends Component {


    state={
        loading:false
    }

    componentDidMount() {

    }


    verifSession(){
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    render() {

        if(this.state.loading === true){
            return(
                <MuiBackdrop open={true} />
            )
        }else{
            return (
                <Router>
                    <Switch>
                        {
                            this.verifSession() === true &&
                                [
                                    <Redirect key={0} exact from={"/sso/login"} to={"/main/infos"}/>,
                                    <Redirect key={1} exact from={"/sso/signup"} to={"/main/infos"}/>
                                ]
                        }
                        <Redirect exact from={"/"} to={this.verifSession() === false ? "/sso/login" : "/main/infos"} />
                        {
                            this.verifSession() === false &&
                            [
                                <Route key={0} exact path="/sso/login" component={Login}/>,
                                <Route key={1} exact path="/sso/signup" component={Signup}/>
                            ]
                        }
                        <Route exact  path="/sso/login/:redirect" component={Login}/>
                        <Route exact  path="/sso/reset" component={ResetRequest}/>
                        <Route exact  path="/sso/reset/:email/:key" component={Reset}/>
                        <Route exact  path="/sso/reset/:email" component={Reset}/>
                        <Route exact  path="/registries/:registries/key/:key/:infos" component={Registry}/>
                        <Route path="/main" component={withRouter(Main)}/>

                        <Route exact  path="/sso/extern/:key/:auth" component={Extern_login}/>
                        <Route exact  path="/sso/extern/:key/:auth/signup" component={Extern_signup}/>
                        <Route exact  path="/sso/extern/:key/:auth/accept" component={Accept_service}/>

                    </Switch>
                </Router>
            )
        }
    }

}




