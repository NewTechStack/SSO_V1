import React from "react";
import './main.css'
import classnames from 'classnames';
import Application from 'react-rainbow-components/components/Application';
import Sidebar from 'react-rainbow-components/components/Sidebar';
import SidebarItem from 'react-rainbow-components/components/SidebarItem';
import ButtonIcon from 'react-rainbow-components/components/ButtonIcon';
import RenderIf from 'react-rainbow-components/components/RenderIf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Routes from './routes';
import SectionHeading from '../../components/SectionHeading';
import {
    Lock,
    DashboardIcon,
    PagesIcon,
    TwitterIcon
} from '../../components/icons';
import { navigateTo } from './history';
import moment from "moment";




export default class main extends React.Component{

    state={
        selectedItem:"dash",
        session:false,
        isSidebarHidden:true
    }

    componentDidMount() {
        console.log(localStorage)
        const isMobileViewPort = document.body.offsetWidth < 600;
        this.setState({isSidebarHidden:isMobileViewPort})
        if(this.verifSession() === true){
            let path_array = this.props.location.pathname.split("/")
            let current = path_array[path_array.length -1]
            this.setState({selectedItem:current,session:true})
        }else{
            this.props.history.push("/sso/login")
        }

    }

    verifSession(){
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
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
                        className="react-rainbow-admin-app_sidebar"
                        selectedItem={selectedItem}
                        onSelect={(e,selected) => {this.setState({selectedItem:selected})}}>
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<DashboardIcon size={20} />}
                            name="dash"
                            label="Accueil"
                            onClick={() => navigateTo('/main/dash')} />
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<PagesIcon size={20} />}
                            name="infos"
                            label="Informations personnelles"
                            onClick={() => navigateTo('/main/infos')} />
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<Lock size={20} />}
                            name="security"
                            label="Securité"
                            onClick={() => navigateTo('/main/security')} />
                        <SidebarItem
                            className="react-rainbow-admin-app_sidebar-item"
                            icon={<TwitterIcon size={20} />}
                            name="Pro"
                            label="Pro"
                            onClick={() => navigateTo('/main/pro')} />
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