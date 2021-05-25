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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from "moment";
import Button from "@material-ui/core/Button";
import { useSnackbar } from 'notistack';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Divider from '@material-ui/core/Divider';
import {IconButton} from "@material-ui/core";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MuiButton, { ButtonGroup as MuiButtonGroup } from '@atlaskit/button';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';

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

}));

export default function Info(props){

    const { enqueueSnackbar } = useSnackbar();

    const f_name_ref = React.useRef();
    const l_name_ref = React.useRef();

    const classes = useStyles();

    const [loading, setLoading] = React.useState(true);

    const [roles, setRoles] = React.useState([]);

    const [firstname, setFirstname] = React.useState("");
    const [fname_lupdate, setFname_lupdate] = React.useState("");

    const [lastname, setLastname] = React.useState("");
    const [lname_lupdate, setLname_lupdate] = React.useState("");
    const [birthday, setBirthday] = React.useState(moment().format("YYYY-MM-DD"));

    const [phone, setPhone] = React.useState("");
    const [phone_lupdate, setPhone_lupdate] = React.useState("");

    const [selected_fname_status, setSelected_fname_status] = React.useState("private");
    const [selected_phone_status, setSelected_phone_status] = React.useState("private");


    const [expanded, setExpanded] = React.useState(false);

    useEffect(() => {
            if(verifSession() === true){
                getUserInfo()
            }else{
                props.history.push("/sso/login")
            }
    }, [getUserInfo]);

    const verifSession = () => {
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    const getUserInfo = () => {
        SSO_service.getUser(localStorage.getItem("usrtoken")).then(infoRes => {
            console.log(infoRes)
            if(infoRes.status === 200 && infoRes.succes === true){

                let roles_object = infoRes.data.roles || {}
                const roles_array = [];
                Object.keys(roles_object).forEach(key => roles_array.push({
                    role: key,
                    data: roles_object[key]
                }));
                console.log(roles_array)
                setRoles(roles_array)
                console.log(roles_array)
                setFirstname(infoRes.data.first_name.main || "")
                setLastname(infoRes.data.last_name.main || "")
                setSelected_fname_status(infoRes.data.last_name.public === true ? "public" : "private")
                setPhone(infoRes.data.phone.main ? infoRes.data.phone.main.number ? infoRes.data.phone.main.number : "" : "")
                setSelected_phone_status(infoRes.data.phone.public === true ? "public" : "private")
                setFname_lupdate(infoRes.data.first_name.last_update || "")
                setLname_lupdate(infoRes.data.first_name.last_update || "")
                setPhone_lupdate(infoRes.data.phone.last_update || "")
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


    const updateUser = (data) => {
        setLoading(true)
        SSO_service.updateUser(data,localStorage.getItem("usrtoken")).then( updateRes => {
            if (updateRes.status === 200 && updateRes.succes === true) {
                setTimeout(() => {
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
                                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                    <AccordionSummary
                                        expandIcon={<EditIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography className={classes.heading}>Nom et Prénom</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {firstname + " " +lastname}
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
                                                    inputRef={f_name_ref}
                                                    label="Nom"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={firstname}
                                                    onChange={(e) => {setFirstname(e.target.value)}}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    inputRef={l_name_ref}
                                                    label="Prénom"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={lastname}
                                                    onChange={(e) => {setLastname(e.target.value)}}
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
                                                            onClick={() => {
                                                                updateUser({first_name:{first_name:firstname,public:selected_fname_status !== "private"},
                                                                    last_name:{last_name:lastname,public:selected_fname_status !== "private"}})
                                                            }}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel2'}
                                           //onChange={handleChange('panel2')}
                                >
                                    <AccordionSummary
                                        //expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Email</Typography>
                                        <Typography className={classes.secondaryHeadingTitle}>
                                            {localStorage.getItem("email")}
                                        </Typography>
                                    </AccordionSummary>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                                    <AccordionSummary
                                        expandIcon={<EditIcon />}
                                        aria-controls="panel3bh-content"
                                        id="panel3bh-header"
                                    >
                                        <Typography className={classes.heading}>Téléphone</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                {phone}
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
                                </Accordion>
                                <Accordion expanded={expanded === 'panel4'}
                                           //onChange={handleChange('panel4')}
                                >
                                    <AccordionSummary
                                        expandIcon={<EditIcon />}
                                        aria-controls="panel4bh-content"
                                        id="panel4bh-header"
                                    >
                                        <Typography className={classes.heading}>Date de naissance</Typography>
                                        <Typography className={classes.secondaryHeading}>
                                            {/*{moment(birthday).format("DD-MM-YYYY")}*/}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="row mt-2">
                                            <div className="col-md-12">
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker
                                                        margin="normal"
                                                        id="date-picker-dialog"
                                                        label="Date de naissance"
                                                        format="dd/MM/yyyy"
                                                        value={""}
                                                        onChange={(date) => {setBirthday(moment(date).format("YYYY-MM-DD"))}}
                                                        KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </div>

                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
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
                                                        <MuiButton appearance="primary" isDisabled={item.data.active === false}
                                                                   iconAfter={item.data.active === true ? <CheckIcon /> : <BlockIcon/>}>
                                                            {item.role}
                                                        </MuiButton>
                                                    ))
                                                }

                                            </MuiButtonGroup>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                {/*<Accordion expanded={expanded === 'panel5'}
                                    //onChange={handleChange('panel4')}
                                >
                                    <AccordionSummary
                                        //expandIcon={<EditIcon />}
                                        aria-controls="panel4bh-content"
                                        id="panel4bh-header"
                                    >
                                        <Typography className={classes.heading}>Mot de passe</Typography>
                                        <div>
                                            <Typography className={classes.secondaryHeadingTitle}>
                                                ••••••••
                                            </Typography>
                                            <Typography className={classes.secondaryHeading}>

                                            </Typography>
                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>

                                    </AccordionDetails>
                                </Accordion>*/}
                            </div>



                        </div>
                    </div>

                </div>
            </div>
        </div>
    )

}
