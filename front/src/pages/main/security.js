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
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from "moment";
import Button from "@material-ui/core/Button";
import { useSnackbar } from 'notistack';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorIcon from '@material-ui/icons/Error';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

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

export default function Security(props){

    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    const [loading, setLoading] = React.useState(true);
    const [openDeleteAccountModal, setOpenDeleteAccountModal] = React.useState(false);

    const [currentPwd, setCurrentPwd] = React.useState("");
    const [newPwd1, setNewPwd1] = React.useState("");
    const [newPwd2, setNewPwd2] = React.useState("");

    const [infoAccount, setInfoAccount] = React.useState({});
    const [expanded, setExpanded] = React.useState(false);

    useEffect(() => {
        setTimeout(() => {
            if(verifSession() === true){
                getAccountInfo()
            }else{
                props.history.push("/sso/login")
            }
        },2000)

    }, [getAccountInfo]);

    const verifSession = () => {
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    const getAccountInfo = () => {
        SSO_service.getAccountInfo(localStorage.getItem("usrtoken")).then(infoRes => {
            console.log(infoRes)
            if(infoRes.status === 200 && infoRes.succes === true){
                setInfoAccount(infoRes.data)
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

                            <h5 style={{fontSize:"1.25rem"}}>Sécurité</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Paramètres et recommandations pour vous aider à protéger votre compte</label>


                            <div style={{marginTop:40,padding:15}} className="accordion_form">
                                <Accordion expanded={expanded === 'panel1'}
                                           //onChange={handleChange('panel1')}
                                >
                                    <AccordionSummary
                                        expandIcon={<AssignmentTurnedInIcon color="secondary" />}
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
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel2'}
                                    //onChange={handleChange('panel2')}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Username</Typography>
                                        <Typography className={classes.secondaryHeadingTitle}>
                                            {infoAccount.username}
                                        </Typography>
                                    </AccordionSummary>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel3bh-content"
                                        id="panel3bh-header"
                                    >
                                        <Typography className={classes.heading}>Dernier modification</Typography>
                                        <div>
                                            {
                                                !loading &&
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    {moment(infoAccount.roles.user.last_update).format("DD-MM-YYYY HH:mm")}
                                                </Typography>
                                            }

                                        </div>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel6'}
                                    onChange={handleChange('panel6')}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronRightIcon />}
                                        aria-controls="panel2bh-content"
                                        id="panel2bh-header"
                                    >
                                        <Typography className={classes.heading}>Vérification</Typography>
                                        {
                                            !loading &&
                                            <div>
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    Contact:&nbsp;&nbsp;{infoAccount.verified.contact === true ? <AssignmentTurnedInIcon color="secondary"/> : <ErrorIcon color="disabled"/>}
                                                </Typography>
                                                <Typography className={classes.secondaryHeadingTitle}>
                                                    Identité:&nbsp;&nbsp;{infoAccount.verified.identity === true ? <AssignmentTurnedInIcon color="secondary"/> : <ErrorIcon color="disabled"/>}
                                                </Typography>
                                            </div>
                                        }


                                    </AccordionSummary>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel4'}
                                    onChange={handleChange('panel4')}
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
                                        {/*<div className="row mt-2">
                                            <div className="col-md-12 mt-1">
                                                <TextField
                                                    label="Votre mot de passe actuel"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    value={currentPwd}
                                                    type="password"
                                                    onChange={(e) => {setCurrentPwd(e.target.value)}}
                                                />
                                            </div>
                                        </div>*/}
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
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={handleChange('panel4')}>Annuler</Button>
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
                                </Accordion>
                                <Accordion expanded={expanded === 'panel5'}
                                    onChange={handleChange('panel5')}
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
        </div>
    )

}