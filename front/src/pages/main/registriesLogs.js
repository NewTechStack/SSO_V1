import React, {useEffect} from "react";
import utilFunctions from "../../tools/functions";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import SSO_service from "../../provider/SSO_service";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ComputerIcon from '@material-ui/icons/Computer';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import TabletIcon from '@material-ui/icons/Tablet';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import chromeIcon from "../../assets/icons/browsers/chrome.png"
import firefoxIcon from "../../assets/icons/browsers/firefox.png"
import safariIcon from "../../assets/icons/browsers/safari.png"
import operaIcon from "../../assets/icons/browsers/opera.png"
import webIcon from "../../assets/icons/browsers/web.png"
import moment from "moment";

export default function RegistriesLogs(props) {


    const [loading, setLoading] = React.useState(true);
    const [regLogs, setRegLogs] = React.useState();


    useEffect(async() => {

        if (utilFunctions.verif_session() === true) {
            await getRegistriesLogs()
        } else {

        }


    }, []);

    const getRegistriesLogs = () => {
        return new Promise(resolve => {

            SSO_service.getRegistriesLogs(localStorage.getItem("usrtoken")).then( logsRes => {
                if(logsRes.status === 200 && logsRes.succes === true){
                    let data = logsRes.data || []
                    console.log(data)
                    setRegLogs(data)
                    setLoading(false)
                    resolve("true")
                }else{
                    resolve("false")
                }
            }).catch( err => {
                console.log(err)
                resolve("false")
            })

        })
    }

    const getInfoRegistre = async (reg_id) => {

        return new Promise(resolve => {
            setLoading(true)
            SSO_service.get_info_registre(reg_id, localStorage.getItem("usrtoken")).then(infoRes => {
                console.log(infoRes)
                if (infoRes.status === 200 && infoRes.succes === true) {
                    setLoading(false)
                    resolve(infoRes.data.name.main || "")
                } else {
                    setLoading(false)
                    resolve("false")
                }
            }).catch(err => {
                console.log(err)
                setLoading(false)
                resolve("false")
            })
        })
    }

    const renderDeviceForm = (item,key) => {
        //console.log(item)
        let data = item.browser[0].ip[0].registry[0]
        let device = data[0].details.device
        let browser = data[0].details.browser
        /*let browsers = [];
        item.browser.map( browser => {
            browser.ip && browser.ip.length > 0 && browser.ip[0].registry && browser.ip[0].registry.length > 0 && (browser.ip[0].registry[0]).length > 0 &&
                browsers.push( ((browser.ip[0].registry[0])[0]).details.browser.family)
        })*/
        /*console.log(device)
        console.log(browser)*/
        return(

            <Accordion id={key} defaultExpanded={false}
            >
                <AccordionSummary
                    expandIcon={<ChevronRightIcon />}
                    aria-controls={"panel-content"+key}
                    id={"panel"+key}
                >
                    <div style={{flexBasis: '12%',flexShrink: 0}}>
                        {
                            device.type && device.type.pc === true ?
                                <ComputerIcon style={{fontSize:"2.5rem",color:"#1c94fe"}}/> :
                                device.type && device.type.mobile === true ?
                                    <PhoneAndroidIcon style={{fontSize:"2.5rem",color:"#1c94fe"}}/> :
                                    device.type && device.type.tablet === true ?
                                        <TabletIcon style={{fontSize:"2.5rem",color:"#1c94fe"}}/> :
                                        <ChildCareIcon style={{fontSize:"2.5rem",color:"#1c94fe"}}/>

                        }
                    </div>
                    <div style={{flexBasis: '68%',flexShrink: 0}}>
                        <Typography>
                            {device.type.pc === true ? "Ordinateur: " : device.type.mobile === true ? "Téléphone: " : device.type.tablet === true ? "Tablette: " : "Bot"}
                            {device.brand ? (device.brand) : ""}
                            {device.os.family ? (" <"+device.os.family+">") : ""}
                        </Typography>
                        <Typography style={{marginTop:5}}>
                            Navigateur&nbsp;
                            {
                                browser.family && (browser.family === "Chrome" || browser.family === "Chrome Mobile") ?
                                    <img alt="" src={chromeIcon} style={{height:20,width:20}}/> :
                                    browser.family && (browser.family === "Firefox" || browser.family === "Firefox Mobile") ?
                                        <img alt="" src={firefoxIcon} style={{height:20,width:20}}/> :
                                        browser.family && (browser.family === "Opera" || browser.family === "Opera Mobile") ?
                                            <img alt="" src={operaIcon} style={{height:20,width:20}}/>:
                                            browser.family && (browser.family === "Safari" || browser.family === "Safari Mobile") ?
                                                <img alt="" src={safariIcon} style={{height:20,width:20}}/> :
                                                <img alt="" src={webIcon} style={{height:20,width:20}}/>
                            }
                        </Typography>
                    </div>



                </AccordionSummary>
                <AccordionDetails>

                    {
                        item.browser.map((br,k) => (
                            br && br.ip && br.ip.length > 0 && br.ip[0].registry && br.ip[0].registry.length > 0 && (br.ip[0].registry[0]).length > 0 &&
                            renderBrowserForm(br,k)
                        ))
                    }

                </AccordionDetails>
            </Accordion>


        )
    }

    const renderBrowserForm = (item,key) => {
        let data = item.ip[0].registry[0]
        let details = data[0]
        let browser = data[0].details.browser
        return(
            <div style={{border:"1px solid #dadce0",borderRadius:8}}>

                <Accordion id={"key"+key} defaultExpanded={false}
                >
                    <AccordionSummary
                        expandIcon={<ChevronRightIcon />}
                        aria-controls={"panel-content-2"+key}
                        id={"panel-2"+key}
                    >

                        <div style={{flexBasis: '12%',flexShrink: 0,alignSelf:"center"}}>
                            {
                                browser.family && (browser.family === "Chrome" || browser.family === "Chrome Mobile") ?
                                    <img alt="" src={chromeIcon} style={{height:30,width:30}}/> :
                                    browser.family && (browser.family === "Firefox" || browser.family === "Firefox Mobile") ?
                                        <img alt="" src={firefoxIcon} style={{height:30,width:30}}/> :
                                        browser.family && (browser.family === "Opera" || browser.family === "Opera Mobile") ?
                                            <img alt="" src={operaIcon} style={{height:30,width:30}}/>:
                                            browser.family && (browser.family === "Safari" || browser.family === "Safari Mobile") ?
                                                <img alt="" src={safariIcon} style={{height:30,width:30}}/> :
                                                <img alt="" src={webIcon} style={{height:30,width:30}}/>

                            }
                        </div>

                        <div style={{flexBasis: '68%',flexShrink: 0}}>
                            <Typography>
                                {browser.family || ""}
                            </Typography>
                            <Typography style={{color:"grey",fontSize:"0.7rem"}}>
                                Version:&nbsp;
                                {
                                    (browser.version && browser.version !== "") ? (" <" + browser.version + ">") : ""
                                }
                            </Typography>
                        </div>

                    </AccordionSummary>

                    <AccordionDetails>

                        <div style={{border:"1px solid #dadce0",borderRadius:8,padding:10,marginBottom:20,marginLeft:20,paddingLeft:25}}>
                            <h6>{details.details.ip && details.details.ip.address ? ("ip: " + details.details.ip.address) : "" }</h6>
                            <div style={{marginTop:10}}>
                                <div className="row">
                                    <div className="col-lg-3 mb-1">
                                        <h6>{details.date.start ? ("date début: " + moment(details.date.start).format("DD-MM-YYYY HH:mm")) : ""}</h6>
                                    </div>
                                    <div className="col-lg-5 mb-1">
                                        <h6>{details.registry_id ? ("Registre: "+details.registry_id) : ""}</h6>
                                    </div>
                                    <div className="col-lg-4 mb-1">
                                        <h6>{details.manual_validation === true ? "validation manuelle" : "validation non manuelle"}</h6>
                                    </div>
                                </div>
                                <p style={{color:"grey"}}>Vous avez partagé:&nbsp;{details.data && details.data.length > 0 ? details.data.join(", ") : ""}</p>
                            </div>
                        </div>

                    </AccordionDetails>

                </Accordion>
            </div>

        )
    }

    return (
        <div>

            <MuiBackdrop open={loading}/>
            <div className="container container-lg" style={{marginTop: 50}}>
                <div className="info_form">
                    <div>
                        <div className="main_padding-form">
                            <h5 style={{fontSize: "1.25rem"}}>Logs</h5>
                            <label style={{color: "#5f6368", fontSize: 12}}>Quelques détails concernant l'activité sur vos registres</label>
                            {
                                loading === false &&
                                <div style={{marginTop:40,padding:15}} className="accordion_form">

                                    {
                                        regLogs.devices.map( (item,key) => (
                                            renderDeviceForm(item,key)
                                        ))
                                    }
                                </div>
                            }




                        </div>
                    </div>
                </div>
            </div>

        </div>
    )


}
