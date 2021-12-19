import React from "react";
import './main.css'
import classnames from 'classnames';
import Application from 'react-rainbow-components/components/Application';
import Sidebar from 'react-rainbow-components/components/Sidebar';
import SidebarItem from 'react-rainbow-components/components/SidebarItem';
import ButtonIcon from 'react-rainbow-components/components/ButtonIcon';
import RenderIf from 'react-rainbow-components/components/RenderIf';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Routes from './routes';
import SectionHeading from '../../components/SectionHeading';
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import LockIcon from '@material-ui/icons/Lock';
import BallotIcon from '@material-ui/icons/Ballot';


export default class main extends React.Component{

    state={
        selectedItem:"dash",
        session:false,
        isSidebarHidden:true,
        is_have_admin_acces:false
    }

    componentDidMount() {
        console.log(this.props)
        const isMobileViewPort = document.body.offsetWidth < 600;
        this.setState({isSidebarHidden:isMobileViewPort})
        if(this.verifSession() === true){
            this.verif_acces_roles()
            let path_array = this.props.location.pathname.split("/")
            console.log(path_array)
            let menuItems = ["infos","registres","admin"];
            let current = path_array[path_array.length -1]
            console.log(current)
            this.setState({selectedItem:menuItems.find(x => x === current) ? current : path_array[path_array.length -2] === "registre" ? "registres" : "infos",session:true})
        }else{
            this.props.history.push("/sso/login")
        }

    }

    verifSession(){
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    verif_acces_roles(){
        let roles = JSON.parse(localStorage.getItem("roles")) || []
        console.log(roles)
        if(roles.find(x => x.role === "admin" || x.role === "creator")){
            this.setState({is_have_admin_acces:true})
        }
    }

    getSidebarClassNames() {
        return classnames('react-rainbow-admin-app_sidebar-container', {
            'react-rainbow-admin-app_sidebar-container--sidebar-hidden': this.state.isSidebarHidden,
        });
    }


    render() {
        const { selectedItem,session,isSidebarHidden } = this.state;

        return(
            <Application>
                <RenderIf isTrue={!isSidebarHidden}>
                    <div
                        className="react-rainbow-admin-app_backdrop"
                        role="presentation"
                        onClick={() => {this.setState({isSidebarHidden:!isSidebarHidden})}} />
                </RenderIf>
                <RenderIf isTrue={session}>
                    <SectionHeading onToogleSidebar={() => this.setState({isSidebarHidden:!isSidebarHidden})} />
                </RenderIf>
                <div className={this.getSidebarClassNames()}>
                    <Sidebar
                        id="sidebar-1"
                        className="react-rainbow-admin-app_sidebar"
                        selectedItem={selectedItem}
                        onSelect={(e,selected) => {this.setState({selectedItem:selected})}}>
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<ContactPhoneIcon fontSize="medium" style={{color:"#00AEF9"}} />}
                            name="infos"
                            label="Informations personnelles"
                            onClick={() => this.props.history.push('/main/infos')} />
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<BallotIcon fontSize="medium" style={{color:"#00AEF9"}} />}
                            name="registres"
                            label="Registres"
                            onClick={() => this.props.history.push('/main/registres')} />
                        {
                            this.state.is_have_admin_acces === true &&
                            <SidebarItem
                                className="react-rainbow-admin-app_sidebar-item"
                                icon={<LockIcon fontSize="medium" style={{color:"#00AEF9"}} />}
                                name="admin"
                                label="Admin"
                                onClick={() => this.props.history.push('/main/admin')} />
                        }

                    </Sidebar>
                    <RenderIf isTrue={!isSidebarHidden}>
                        <div className="react-rainbow-admin-app_sidebar-back-button-container">
                            <ButtonIcon
                                onClick={() => {this.setState({isSidebarHidden: !isSidebarHidden})}}
                                size="large"
                                icon={
                                    <FontAwesomeIcon className="react-rainbow-admin-app_sidebar-back-button-icon" icon={faArrowLeft} />
                                } />
                        </div>
                    </RenderIf>
                </div>
                <div className="react-rainbow-admin-app_router-container">
                    <Routes />
                </div>
            </Application>
        )
    }


}
