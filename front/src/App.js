import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import MuiBackdrop from "./components/Loading/MuiBackdrop";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Main from "./pages/main/main"
import Reset from "./pages/auth/reset"
import Registry from "./pages/auth/registry"
import ResetRequest from "./pages/auth/resetRequest"
import moment from "moment";




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
                        <Redirect exact from={"/"} to={this.verifSession() === false ? "/sso/login" : "/main/dash"} />
                        <Route exact  path="/sso/login" component={Login}/>
                        <Route exact  path="/sso/login/:redirect" component={Login}/>
                        <Route exact  path="/sso/signup" component={Signup}/>
                        <Route exact  path="/sso/reset" component={ResetRequest}/>
                        <Route exact  path="/sso/reset/:email/:key" component={Reset}/>
                        <Route exact  path="/sso/reset/:email" component={Reset}/>
                        <Route exact  path="/registries/:registries/key/:key/:infos" component={Registry}/>
                        <Route path="/main" component={Main}/>
                    </Switch>
                </Router>
            )
        }
    }

}




