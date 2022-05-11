import React,{useEffect} from "react";
import TextField from "@material-ui/core/TextField";
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
import SSO_service from "../../provider/SSO_service";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import PhoneInput from 'react-phone-input-2'
import '../../assets/css/phone-input2-material.css'
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import moment from "moment";
import Button from "@material-ui/core/Button";
import { useSnackbar } from 'notistack';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import MuiButton, { ButtonGroup as MuiButtonGroup } from '@atlaskit/button';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import { Popup } from 'semantic-ui-react'
import Divider from "@material-ui/core/Divider";
import Modal, {ModalTransition} from "@atlaskit/modal-dialog";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ErrorIcon from "@material-ui/icons/Error";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import HelpIcon from "@material-ui/icons/Help";
import CloseIcon from '@material-ui/icons/Close';
import jwt_decode from "jwt-decode";
import utilFunctions from "../../tools/functions";
import checkicon from "../../assets/icons/check_icon.png"
import MenuItem from '@material-ui/core/MenuItem';
import {countryList} from "../../constants/defaultValues";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
        color: theme.palette.text.primary
    },
    secondaryHeadingTitle: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    }

}));

export default function Info(props){

    const { enqueueSnackbar } = useSnackbar();

    let kyc_passport = React.useRef();
    const f_name_ref = React.useRef();
    const l_name_ref = React.useRef();

    const classes = useStyles();
    const [loading, setLoading] = React.useState(true);

    const [roles, setRoles] = React.useState([]);
    const [firstname, setFirstname] = React.useState(null);
    const [fname_lupdate, setFname_lupdate] = React.useState("");

    const [lastname, setLastname] = React.useState(null);
    const [lname_lupdate, setLname_lupdate] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [phone_lupdate, setPhone_lupdate] = React.useState("");

    const [nationality, setNationality] = React.useState(null);
    const [nationality_lupdate, setNationality_lupdate] = React.useState("");

    //adress
    const [adr_street, setAdr_street] = React.useState("");
    const [adr_pc, setAdr_pc] = React.useState("");
    const [adr_city, setAdr_city] = React.useState("");
    const [adr_pays, setAdr_pays] = React.useState("");
    const [location_lupdate, setLocation_lupdate] = React.useState("");

    const [selected_fname_status, setSelected_fname_status] = React.useState("private");
    const [selected_phone_status, setSelected_phone_status] = React.useState("private");
    const [selected_nationality_status, setSelected_nationality_status] = React.useState("private");
    const [selected_location_status, setSelected_location_status] = React.useState("private");
    const [expanded, setExpanded] = React.useState(false);

    //security
    const [openDeleteAccountModal, setOpenDeleteAccountModal] = React.useState(false);
    const [openConfirmUpdateModal, setOpenConfirmUpdateModal] = React.useState(false);
    const [newPwd1, setNewPwd1] = React.useState("");
    const [newPwd2, setNewPwd2] = React.useState("");

    const [infoAccount, setInfoAccount] = React.useState({});
    const [expanded_sec, setExpanded_sec] = React.useState(false);


    const [selected_username, setSelected_username] = React.useState("");
    const [selected_email_status, setSelected_email_status] = React.useState("private");

    useEffect(() => {
            if(utilFunctions.verif_session() === true){
                getAccountInfo()
                getUserInfo()
            }else{
                /*if(props.history.location.pathname && props.history.location.pathname.trim() !== "" && props.history.location.pathname.length > 1){
                    let path = props.history.location.pathname + ((props.history.location.hash && props.history.location.hash.trim() !== "") ? props.history.location.hash :"" )
                    props.history.push("/sso/login?" + path)
                }else{
                    props.history.push("/sso/login")
                }*/
            }
    }, []);


    const getUserInfo = () => {
        SSO_service.getUser(localStorage.getItem("usrtoken")).then(infoRes => {
            console.log(infoRes)
            if(infoRes.status === 200 && infoRes.succes === true){
                console.log(infoRes)
                let roles_object = infoRes.data.roles || {}
                const roles_array = [];
                Object.keys(roles_object).forEach(key => roles_array.push({
                    role: key,
                    data: roles_object[key]
                }));
                setRoles(roles_array)
                setFirstname(infoRes.data.first_name.main ? infoRes.data.first_name.main : null)
                setLastname(infoRes.data.last_name.main ? infoRes.data.last_name.main : null)
                /*if(infoRes.data.verified.identity && infoRes.data.verified.identity.score === 3 ){
                    setFirstname((infoRes.data.verified.identity.data.first_name.main === true || infoRes.data.verified.identity.data.first_name.main === null) ? "" : infoRes.data.verified.identity.data.first_name.main === true )
                    setLastname((infoRes.data.verified.identity.data.last_name.main === true || infoRes.data.verified.identity.data.last_name.main === null) ? "" : infoRes.data.verified.identity.data.last_name.main)
                }*/
                setSelected_fname_status(infoRes.data.last_name.public === true ? "public" : "private")
                setPhone(infoRes.data.phone.main ? infoRes.data.phone.main.number ? infoRes.data.phone.main.number : "" : "")
                setSelected_username(infoRes.data.username || "")
                setSelected_phone_status(infoRes.data.phone.public === true ? "public" : "private")
                setSelected_nationality_status(infoRes.data.nationality ? infoRes.data.nationality.public === true ? "public" : "private" : "private")
                setSelected_location_status(infoRes.data.location ? infoRes.data.location.public === true ? "public" : "private" : "private")
                setFname_lupdate(infoRes.data.first_name.last_update || "")
                setLname_lupdate(infoRes.data.first_name.last_update || "")
                setPhone_lupdate(infoRes.data.phone.last_update || "")

                setNationality_lupdate(infoRes.data.nationality ? (infoRes.data.nationality.last_update || "") : "")
                setNationality(infoRes.data.nationality ? infoRes.data.nationality.main : "")

                setAdr_street(infoRes.data.location ? (infoRes.data.location.main.details.street || "") : "")
                setAdr_pc(infoRes.data.location ? (infoRes.data.location.main.details.postal_code || "") : "")
                setAdr_city( infoRes.data.location ? (infoRes.data.location.main.city || "") : "")
                setAdr_pays(infoRes.data.location ? (infoRes.data.location.main.country || "") : "")
                setLocation_lupdate(infoRes.data.location ? (infoRes.data.location.last_update || "") : "")

                setLoading(false)
            }else{
                enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                setLoading(false)
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
            setLoading(false)
        })
    }

    const getAsyncUserInfo = () => {

        return new Promise( resolve => {

            SSO_service.getUser(localStorage.getItem("usrtoken")).then(infoRes => {
                console.log(infoRes)
                if(infoRes.status === 200 && infoRes.succes === true){

                    let roles_object = infoRes.data.roles || {}
                    const roles_array = [];
                    Object.keys(roles_object).forEach(key => roles_array.push({
                        role: key,
                        data: roles_object[key]
                    }));
                    setRoles(roles_array)
                    if(infoRes.data.verified.identity && infoRes.data.verified.identity.score === 3 ){
                        setFirstname((infoRes.data.verified.identity.data.first_name.main === true || infoRes.data.verified.identity.data.first_name.main === null) ? "" : infoRes.data.verified.identity.data.first_name.main === true )
                        setLastname((infoRes.data.verified.identity.data.last_name.main === true || infoRes.data.verified.identity.data.last_name.main === null) ? "" : infoRes.data.verified.identity.data.last_name.main)
                    }
                    setSelected_fname_status(infoRes.data.last_name.public === true ? "public" : "private")
                    setPhone(infoRes.data.phone.main ? infoRes.data.phone.main.number ? infoRes.data.phone.main.number : "" : "")
                    setSelected_username(infoRes.data.username || "")
                    setSelected_phone_status(infoRes.data.phone.public === true ? "public" : "private")
                    setFname_lupdate(infoRes.data.first_name.last_update || "")
                    setLname_lupdate(infoRes.data.first_name.last_update || "")
                    setPhone_lupdate(infoRes.data.phone.last_update || "")
                    setLoading(false)
                    resolve(true)
                }else{
                    enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                    setLoading(false)
                    resolve(false)
                }
            }).catch(err => {
                console.log(err)
                enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                setLoading(false)
                resolve(false)
            })

        })

    }

    const updateUser = (data) => {
        setLoading(true)
        SSO_service.updateUser(data,localStorage.getItem("usrtoken")).then( updateRes => {
            if (updateRes.status === 200 && updateRes.succes === true) {
                setTimeout(() => {
                    getAccountInfo()
                        enqueueSnackbar('Modification effectuée avec succès', { variant:"success" })
                        setLoading(false)
                    },1000)
            } else {
                enqueueSnackbar('Une erreur est survenue ! Modification non effectuée', { variant:"error" })
                setLoading(false)
            }
            console.log(updateRes)
        }).catch(err => {
            console.log(err)
            enqueueSnackbar('Une erreur est survenue ! Modification non effectuée', { variant:"error" })
            setLoading(false)
        })
    }

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    const handleChange_sec = (panel) => (event, isExpanded) => {
        setExpanded_sec(isExpanded ? panel : false);
    };


    const getAccountInfo = () => {
        SSO_service.getAccountInfo(localStorage.getItem("usrtoken")).then(infoRes => {
            console.log(infoRes)
            if(infoRes.status === 200 && infoRes.succes === true){
                setInfoAccount(infoRes.data)
                setSelected_email_status(infoRes.data.email.public === true ? "public" : "private")
                setSelected_username(infoRes.data.username || "")
                setLoading(false)
            }else{
                enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                setLoading(false)
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
            setLoading(false)
        })
    }

    const getAsyncAccountInfo = () => {
        return new Promise( resolve => {
            setLoading(true)
            SSO_service.getAccountInfo(localStorage.getItem("usrtoken")).then(infoRes => {
                console.log(infoRes)
                if(infoRes.status === 200 && infoRes.succes === true){
                    setInfoAccount(infoRes.data)
                    setSelected_email_status(infoRes.data.email.public === true ? "public" : "private")
                    setSelected_username(infoRes.data.username || "")
                    setLoading(false)
                    resolve(true)
                }else{
                    enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                    setLoading(false)
                    resolve(false)
                }
            }).catch(err => {
                console.log(err)
                enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                setLoading(false)
                resolve(false)
            })
        })

    }

    const deleteAccount = () => {
        setLoading(true)
        setTimeout(() => {
            SSO_service.deleteAccount(localStorage.getItem("usrtoken")).then( delRes => {
                if(delRes.status === 200 && delRes.succes === true){
                    setLoading(false)
                    localStorage.clear()
                    window.location.reload()
                }else{
                    enqueueSnackbar(delRes.error, { variant:"error" })
                }
            }).catch(err => {
                enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            })
        },4000)
    }
    const changePassword = () => {
        if(newPwd1 === newPwd2){
            setLoading(true)

            SSO_service.getKeyForChangePwd(localStorage.getItem("usrtoken")).then(keyRes => {
                console.log(keyRes)
                if (keyRes.status === 200 && keyRes.succes === true) {

                    SSO_service.changePassword({key:keyRes.data.key,email:localStorage.getItem("email"),password:newPwd1},localStorage.getItem("usrtoken")).then(changeRes => {
                        console.log(changeRes)
                        if (changeRes.status === 200 && changeRes.succes === true) {
                            enqueueSnackbar("Votre mot de passe est changé avec succès", { variant:"success" })
                            setLoading(false)
                            setTimeout(() => {
                                enqueueSnackbar("Réconnexion en cours...", { variant:"success" })
                                setTimeout(() => {
                                    localStorage.removeItem("usrtoken")
                                    localStorage.removeItem("firstname")
                                    localStorage.removeItem("lastname")
                                    localStorage.removeItem("exp")
                                    window.location.reload()
                                },2000)
                            },2000)
                        }else{
                            enqueueSnackbar(changeRes.error, { variant:"error" })
                            setLoading(false)
                        }
                    }).catch(err => {
                        console.log(err)
                        enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
                        setLoading(false)
                    })

                }else{
                    enqueueSnackbar(keyRes.error, { variant:"error" })
                    setLoading(false)
                }
            }).catch(err => {
                console.log(err)
                enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
                setLoading(false)
            })

        }else{
            enqueueSnackbar("Les deux mot de passes ne sont pas identiques !", { variant:"error" })
        }


    }


    const upload_kyc_passport = (e) => {

        let file = e.target.files[0]
        if (file && file.size > 10000000) {
            alert("La taille maximale autorisée est de 10 Mo")
        }else if(file && (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg")){
            alert("Format non autorisé")
        }
        else {
            setLoading(true)
            const data = new FormData();
            data.append("passport", file,file.name);
            console.log(data)
            SSO_service.kyc_upload_passport(localStorage.getItem("usrtoken"),localStorage.getItem("id"),data).then( async res => {
                console.log(res)
                if(res.status === 200 && res.succes === true){
                    setFirstname(res.data.first_name.main)
                    setLastname(res.data.last_name.main)
                    setNationality(res.data.nationality.main)
                    /*await getAsyncAccountInfo()
                    await getAsyncUserInfo()*/
                    setLoading(false)
                    enqueueSnackbar('Opération effectuée avec succès', { variant:"success" })
                }else{
                    setLoading(false)
                    enqueueSnackbar(res.error, { variant:"error" })
                }
            }).catch( err => {
                console.log(err)
                setLoading(false)
                enqueueSnackbar("Une erreur est survenue, veuillez réessayer ultérieurement", { variant:"error" })
            })
        }

    }

    return(

        <div>
            <MuiBackdrop open={loading}/>
            <div className="container container-lg" style={{marginTop:50}}>
                <div className="info_form">
                    <div>
                        <div className="main_padding-form">

                            <h5 style={{fontSize:"1.25rem"}}>Informations générales</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Veuillez enregistrer vos changements en cliquant sur le bouton de validation </label>


                            <div style={{marginTop:40,padding:15}} className="accordion_form">
                                <Accordion expanded={expanded === 'panel-1'}
                                           onChange={handleChange('panel-1')}

                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography className={classes.heading}>Email</Typography>
                                        <div>
                                            {
                                                !loading &&
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    {localStorage.getItem("email")}
                                                </Typography>
                                            }

                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <h6>Choisissez qui peut voir votre adresse mail</h6>
                                                <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                             tabIndex={0} style={{marginTop:10}}
                                                >
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_email_status === "private" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<LockOutlinedIcon />}
                                                            onClick={() => {setSelected_email_status("private")}}
                                                    >Vous uniquement</Button>
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_email_status === "public" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<GroupOutlinedIcon />}
                                                            onClick={() => {setSelected_email_status("public")}}
                                                    >Tout le monde</Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange_sec('panel-1')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                updateUser({email:{public:selected_email_status !== "private"}})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel0'}
                                           onChange={handleChange('panel0')}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Pseudo</Typography>
                                        <Typography className={classes.secondaryHeadingTitle}>
                                            {infoAccount.username}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    //inputRef={f_username_ref}
                                                    label="Pseudo"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={selected_username}
                                                    onChange={(e) => {setSelected_username(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange_sec('panel0')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                updateUser({username:selected_username})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} translate="no">
                                    <AccordionSummary
                                        expandIcon={expanded === 'panel1' ? <CloseIcon /> : <EditIcon/>}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                        translate="no"
                                    >
                                        <Typography className={classes.heading}>
                                            Nom et Prénom&nbsp;
                                            {
                                                !loading  && infoAccount.verified.identity.score === 3 &&
                                                <Popup content={
                                                    <h6 style={{fontSize:"0.8rem"}}>Ce champ a été bien vérifié par KYC</h6>
                                                }
                                                       wide='very'
                                                       size={"small"}
                                                       trigger={<CheckCircleIcon fontSize="small" style={{color:"#1c94fe"}}/>}
                                                />
                                            }

                                        </Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {((firstname === null && lastname === null) || (firstname && firstname.trim() === "") || (lastname && lastname.trim() === "") ) ? "Non renseigné" : (firstname + " " + lastname)}
                                            </Typography>
                                            {
                                                (fname_lupdate || lname_lupdate) ?
                                                    <Typography className={classes.secondaryHeading}>
                                                        Dernière modification: {moment(fname_lupdate || lname_lupdate).format("DD-MM-YYYY HH:mm")}
                                                    </Typography> : null
                                            }
                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    //inputRef={f_name_ref}
                                                    label="Nom"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={firstname}
                                                    onChange={(e) => {setFirstname(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    //inputRef={l_name_ref}
                                                    label="Prénom"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={lastname}
                                                    onChange={(e) => {setLastname(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <h6>Choisissez qui peut voir votre nom et prénom</h6>
                                                <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                             tabIndex={0} style={{marginTop:10}}
                                                >
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_fname_status === "private" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<LockOutlinedIcon />}
                                                            onClick={() => {setSelected_fname_status("private")}}
                                                    >Vous uniquement</Button>
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_fname_status === "public" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<GroupOutlinedIcon />}
                                                            onClick={() => {setSelected_fname_status("public")}}
                                                    >Tout le monde</Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange('panel1')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            disabled={(firstname === null || lastname === null) || ((firstname && firstname.trim() === "")|| (lastname && lastname.trim() === ""))}
                                                            onClick={() => {
                                                                if(infoAccount.verified.identity.score === 3){
                                                                    setOpenConfirmUpdateModal(true)
                                                                }else{
                                                                    updateUser({details:{
                                                                        first_name:{first_name:firstname,public:selected_fname_status !== "private"},
                                                                            last_name:{last_name:lastname,public:selected_fname_status !== "private"}
                                                                    }})
                                                                }
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>

                                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                                    <AccordionSummary
                                        expandIcon={expanded === 'panel3' ? <CloseIcon /> : <EditIcon/>}
                                        aria-controls="panel3bh-content"
                                        id="panel3bh-header"
                                    >
                                        <Typography className={classes.heading}>Téléphone</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {(phone === null || phone.trim() === "") ? "Non renseigné" : phone}
                                            </Typography>
                                            {
                                                phone_lupdate ?
                                                    <Typography className={classes.secondaryHeading}>
                                                        Dernière modification: {moment(phone_lupdate).format("DD-MM-YYYY HH:mm")}
                                                    </Typography> : null
                                            }

                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-md-12">
                                                <PhoneInput
                                                    country={'fr'}
                                                    value={phone}
                                                    onChange={phone => {
                                                        console.log(phone)
                                                        setPhone(phone)
                                                    }}
                                                    masks={{fr: '... ... ...',tn:'.. ... ...'}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <h6>Choisissez qui peut voir votre numéro de téléphone</h6>
                                                <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                             tabIndex={0} style={{marginTop:10}}
                                                >
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_phone_status === "private" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<LockOutlinedIcon />}
                                                            onClick={() => {setSelected_phone_status("private")}}
                                                    >Vous uniquement</Button>
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_phone_status === "public" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<GroupOutlinedIcon />}
                                                            onClick={() => {setSelected_phone_status("public")}}
                                                    >Tout le monde</Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange('panel2')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                updateUser({phone:{number:phone,lang:"FR",public:selected_phone_status !== "private"}})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>

                                <Accordion expanded={expanded === 'panel3'}
                                           onChange={handleChange('panel3')}
                                >
                                    <AccordionSummary
                                        expandIcon={expanded_sec === "panel4" ? <CloseIcon /> : <EditIcon/>}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>
                                            Nationalité&nbsp;
                                            {
                                                !loading  && infoAccount.verified.identity.score === 3 &&
                                                <Popup content={
                                                    <h6 style={{fontSize:"0.8rem"}}>Ce champ a été bien vérifié par KYC</h6>
                                                }
                                                       wide='very'
                                                       size={"small"}
                                                       trigger={<CheckCircleIcon fontSize="small" style={{color:"#1c94fe"}}/>}
                                                />
                                            }
                                        </Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {!loading &&
                                                ((nationality === null || nationality.trim() === "") ? "Non renseigné" : nationality)}
                                            </Typography>
                                            {
                                                nationality_lupdate ?
                                                    <Typography className={classes.secondaryHeading}>
                                                        Dernière modification: {moment(nationality_lupdate).format("DD-MM-YYYY HH:mm")}
                                                    </Typography> : null
                                            }
                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    //inputRef={f_username_ref}
                                                    label="Nationalité"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={nationality}
                                                    onChange={(e) => {setNationality(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <h6>Choisissez qui peut voir votre nationalité</h6>
                                                <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                             tabIndex={0} style={{marginTop:10}}
                                                >
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_nationality_status === "private" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<LockOutlinedIcon />}
                                                            onClick={() => {setSelected_nationality_status("private")}}
                                                    >Vous uniquement</Button>
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_nationality_status === "public" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<GroupOutlinedIcon />}
                                                            onClick={() => {setSelected_nationality_status("public")}}
                                                    >Tout le monde</Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange_sec('panel0')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                updateUser({details:{nationality:{nationality:nationality,public:selected_nationality_status !== "private"}}})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>

                                <Accordion expanded={expanded === 'panel4'}
                                           onChange={handleChange('panel4')}
                                >
                                    <AccordionSummary
                                        expandIcon={expanded_sec === "panel5" ? <CloseIcon /> : <EditIcon/>}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Adresse</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {!loading && infoAccount.location ? ((infoAccount.location.main.details.street || "") + " " + (infoAccount.location.main.details.postal_code || "") + " " + (infoAccount.location.main.city || "") + ", " + (infoAccount.location.main.country || "")) : ""}
                                            </Typography>
                                            {
                                                location_lupdate ?
                                                    <Typography className={classes.secondaryHeading}>
                                                        Dernière modification: {moment(location_lupdate).format("DD-MM-YYYY HH:mm")}
                                                    </Typography> : null
                                            }
                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-lg-6 mt-1">
                                                <TextField
                                                    //inputRef={f_username_ref}
                                                    label="Rue"
                                                    placeholder="Exp: 10 rue de liberté"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={adr_street}
                                                    onChange={(e) => {setAdr_street(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                            <div className="col-lg-6 mt-1">
                                                <TextField
                                                    //inputRef={f_username_ref}
                                                    label="Code postal"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={adr_pc}
                                                    onChange={(e) => {setAdr_pc(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                            <div className="col-lg-6 mt-3">
                                                <TextField
                                                    //inputRef={f_username_ref}
                                                    label="Ville"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={adr_city}
                                                    onChange={(e) => {setAdr_city(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                            <div className="col-lg-6 mt-3">
                                                <Autocomplete
                                                    autoComplete={"off"}
                                                    autoHighlight={false}
                                                    size="small"
                                                    options={countryList}
                                                    classes={{
                                                        option: classes.option,
                                                    }}
                                                    noOptionsText={""}
                                                    getOptionLabel={(option) => option.label}
                                                    renderOption={(option) => (
                                                        <React.Fragment>
                                                            <span>{utilFunctions.countryToFlag(option.code)}</span>
                                                            {option.label} ({option.code})
                                                        </React.Fragment>
                                                    )}
                                                    onChange={(event,value) => {
                                                        console.log(value)
                                                        setAdr_pays(value.label)
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            value={countryList.findIndex(x => x.label === adr_pays) > -1 ? adr_pays : "" }
                                                            label="Pays"
                                                            variant="outlined"
                                                            inputProps={{
                                                                ...params.inputProps,
                                                                autoComplete: 'new-password', // disable autocomplete and autofill
                                                            }}
                                                            InputLabelProps={{shrink:true}}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <h6>Choisissez qui peut voir votre adresse</h6>
                                                <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                             tabIndex={0} style={{marginTop:10}}
                                                >
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_location_status === "private" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<LockOutlinedIcon />}
                                                            onClick={() => {setSelected_location_status("private")}}
                                                    >Vous uniquement</Button>
                                                    <Button style={{textTransform:"none"}}
                                                            className={selected_location_status === "public" ? "selectedBtnGroup no-focus" : "no-focus"}
                                                            startIcon={<GroupOutlinedIcon />}
                                                            onClick={() => {setSelected_location_status("public")}}
                                                    >Tout le monde</Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange_sec('panel0')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                updateUser({details:{location:{location:{country:adr_pays,city:adr_city,details:{street:adr_street,postal_code:adr_pc}},public:selected_location_status !== "private" }}})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>

                                <Accordion expanded={true}
                                >
                                    <AccordionSummary
                                        //expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel3bh-content"
                                        id="panel3bh-header"
                                    >
                                        <Typography className={classes.heading}>Rôles</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>

                                            </Typography>
                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{marginLeft:20,marginTop:-10}}>
                                            <MuiButtonGroup>
                                                {
                                                    roles.map((item, key) => (
                                                        <Popup key={key} content={<h6>id: {item.data.by === null ? "system" : item.data.by } <br/>{item.data.last_update !== null && moment(item.data.last_update).format("DD-MM-YYYY HH:mm")   }</h6>}
                                                               size={"small"}
                                                               trigger={
                                                                   <MuiButton appearance="primary" isDisabled={item.data.active === false}
                                                                              style={{backgroundColor:"#1c94fe"}}
                                                                                   iconAfter={item.data.active === true ? <CheckIcon /> : <BlockIcon/>}>
                                                                   {item.role}
                                                                   </MuiButton>}
                                                        />
                                                    ))
                                                }
                                            </MuiButtonGroup>
                                        </div>
                                    </AccordionDetails>
                                    {/*<Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>*/}
                                </Accordion>
                            </div>



                        </div>
                    </div>


                    <div>
                        <div className="main_padding-form">

                            <h5 style={{fontSize:"1.25rem"}}>Sécurité</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Paramètres et recommandations pour vous aider à protéger votre compte</label>


                            <div style={{marginTop:40,padding:15}} className="accordion_form">

                                <Accordion expanded={expanded_sec === 'panel0'}>
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon style={{cursor:"unset",color:"#fff",opacity:0}} />}
                                        aria-controls="panel3bh-content"
                                        id="panel3bh-header"
                                    >
                                        <Typography className={classes.heading}>Dernière modification</Typography>
                                        <div>
                                            {
                                                !loading &&
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    {infoAccount && infoAccount.roles && infoAccount.roles.user && infoAccount.roles.user.last_update ?
                                                        moment(infoAccount.roles.user.last_update).format("DD-MM-YYYY HH:mm") : "---"}
                                                </Typography>
                                            }

                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded_sec === 'panel1'}>
                                    <AccordionSummary
                                        /*expandIcon={
                                            <Popup content={
                                                <h6 style={{fontSize:"0.8rem"}}>Fonctionnalité non encore disponible</h6>
                                            }
                                                   wide='very'
                                                   size={"small"}
                                                   trigger={<ErrorIcon fontSize="small" color="error"/>}
                                            />
                                        }*/
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Vérification</Typography>
                                        {
                                            !loading &&
                                            <div>
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    Contact:&nbsp;&nbsp;{infoAccount.verified.contact.score === 2 ?
                                                    <Popup content={
                                                        <h6 style={{fontSize:"0.8rem"}}>Vérifié</h6>
                                                    }
                                                           wide='very'
                                                           size={"small"}
                                                           trigger={<CheckCircleIcon fontSize="small" style={{color:"#1c94fe"}}/>}
                                                    />
                                                    :
                                                    <Popup content={
                                                        <h6 style={{fontSize:"0.8rem"}}>Numéro de contact n'est pas encore vérifié ! </h6>
                                                    }
                                                           wide='very'
                                                           size={"small"}
                                                           trigger={<HelpIcon fontSize="small" color="disabled"/>}
                                                    />

                                                }

                                                </Typography>
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    Identité:&nbsp;&nbsp;{infoAccount.verified.identity.score === 3 ?
                                                    <Popup content={
                                                        <h6 style={{fontSize:"0.8rem"}}>Votre identité a été bien vérifié par KYC</h6>
                                                    }
                                                           wide='very'
                                                           size={"small"}
                                                           trigger={<CheckCircleIcon fontSize="small" style={{color:"#1c94fe"}}/>}
                                                    />
                                                     :
                                                    <Popup content={
                                                        <h6 style={{fontSize:"0.8rem"}}>Identité n'est pas encore vérifiée ! </h6>
                                                    }
                                                           wide='very'
                                                           size={"small"}
                                                           trigger={<HelpIcon fontSize="small" color="disabled"/>}
                                                    />
                                                }
                                                    {
                                                        infoAccount.verified.identity.score <= 1 &&
                                                        <div style={{marginTop:5,marginBottom:5}}>
                                                            <div className="kyc-file-upload"
                                                                 onClick={() => {
                                                                     kyc_passport.click()
                                                                 }}
                                                            >
                                                                Télécharger une copie de votre passeport
                                                            </div>
                                                        </div>
                                                    }

                                                    <input accept={["image/png", "image/jpeg", "image/jpg"]}
                                                           style={{
                                                               display: 'false',
                                                               width: 0,
                                                               height: 0
                                                           }}
                                                           ref={(ref) => (kyc_passport = ref)}
                                                           onChange={(e) => {
                                                               upload_kyc_passport(e)
                                                           }}
                                                           type={"file"}
                                                    />

                                                </Typography>
                                            </div>
                                        }


                                    </AccordionSummary>
                                </Accordion>
                                <Accordion expanded={expanded_sec === 'panel2'}
                                           onChange={handleChange_sec('panel2')}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel4bh-content"
                                        id="panel4bh-header"
                                    >
                                        <Typography className={classes.heading}>Changer mon mot de passe</Typography>
                                        <Typography className={classes.secondaryHeading}>
                                            ••••••••
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    label="Nouveau mot de passe"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={newPwd1}
                                                    type="password"
                                                    onChange={(e) => {setNewPwd1(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    label="Confirmer le mot de passe"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={newPwd2}
                                                    type="password"
                                                    onChange={(e) => {setNewPwd2(e.target.value)}}
                                                    InputLabelProps={{shrink:true}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange_sec('panel4')}>Annuler</Button>
                                                    <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                            onClick={() => {
                                                                changePassword()
                                                            }}
                                                    >
                                                        Envoyer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>
                                <Accordion expanded={expanded_sec === 'panel3'}
                                           onChange={handleChange_sec('panel3')}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel4bh-content"
                                        id="panel4bh-header"
                                    >
                                        <Typography className={classes.heading} style={{color:"red"}}>Supprimer mon compte</Typography>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{marginTop:15}}>
                                            <Button variant="contained" style={{textTransform:"none"}} classes="mt-3" color="primary"
                                                    size="small"
                                                    onClick={() => {
                                                        setOpenDeleteAccountModal(true)
                                                    }}
                                            >
                                                Supprimer mon compte
                                            </Button>
                                        </div>
                                    </AccordionDetails>
                                    <Divider style={{marginTop:20,color:"rgba(0, 0, 0, 0.12)"}}/>
                                </Accordion>
                            </div>



                        </div>
                    </div>

                </div>
            </div>

            <ModalTransition>
                {openDeleteAccountModal === true && (
                    <Modal
                        actions={[
                            { text: 'Supprimer', onClick: () => {deleteAccount()}},
                            { text: 'Annuler', onClick: () => {
                                    setOpenDeleteAccountModal(false)
                                }},
                        ]}
                        onClose={() => {
                            setOpenDeleteAccountModal(false)
                        }}
                        heading="Vous êtes sur le point de supprimer votre compte !"
                        appearance="danger"
                    >
                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openConfirmUpdateModal === true && (
                    <Modal
                        actions={[
                            { text: 'Oui', onClick: () => {
                                    setOpenConfirmUpdateModal(false)
                                    updateUser({details:{
                                            first_name:{first_name:firstname,public:selected_fname_status !== "private"},
                                            last_name:{last_name:lastname,public:selected_fname_status !== "private"}
                                        }})
                                }},
                            { text: 'Non', onClick: () => {
                                    setOpenConfirmUpdateModal(false)
                                }},
                        ]}
                        onClose={() => {
                            setOpenConfirmUpdateModal(false)
                        }}
                        heading={<h5 style={{fontSize:"1.2rem",marginTop:10}}>
                            Voulez-vous vraiment modifier ces informations ? Votre vérification KYC sera ignorée
                        </h5>}
                        appearance="warning"
                    >
                    </Modal>
                )}
            </ModalTransition>

        </div>
    )

}
