import React,{useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import SSO_service from "../../provider/SSO_service";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import '../../assets/css/phone-input2-material.css'
import moment from "moment";
import { useSnackbar } from 'notistack';
import {Tab, Tabset} from "react-rainbow-components";
import {Divider, IconButton} from "@material-ui/core";
import AtlButton from "@atlaskit/button";
import AddIcon from "@material-ui/icons/Add";
import DataTable from "react-data-table-component";
import {paginationOptions, tableContextMessage} from "../../constants/defaultValues";
import {Edit, Trash} from "../../components/icons";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Accordion from "@material-ui/core/Accordion";
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import StarIcon from '@material-ui/icons/Star';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Modal, {ModalTransition} from "@atlaskit/modal-dialog";
import TextField from "@material-ui/core/TextField";
import CheckboxSelect from "../../components/Select/CheckboxSelect";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import GroupOutlinedIcon from "@material-ui/icons/GroupOutlined";
import EditIcon from "@material-ui/icons/Edit";
import {CheckboxSelect as Checkbox} from "@atlaskit/select";
import {Label, Popup} from 'semantic-ui-react'
import Textfield from '@atlaskit/textfield';
import CircularProgress from '@material-ui/core/CircularProgress';
import HelpIcon from '@material-ui/icons/Help';
import MuiButton from "@atlaskit/button";
import CheckIcon from "@material-ui/icons/Check";
import BlockIcon from "@material-ui/icons/Block";
import DeleteIcon from '@material-ui/icons/Delete';
import verifForms from '../../tools/verifForms'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        //justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        marginTop: 15,
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
    chip: {
        margin: theme.spacing(0.5),
    },
}));

const customTableStyle = {
    header: {
        style: {
            backgroundColor: "#f0f0f0",
        },
    },
}




export default function RegistreDetails(props){

    console.log(props)

    let role_actions = []

    let new_user_roles = []

    const roles_columns = [
        {
            name: '',
            cell: row => row.type === "custom" ? <div style={{justifyContent:"center"}}>
                <IconButton size="small" onClick={() => {
                    setSelectedRole(row)
                    setNewRole_name(row.name)
                    let actions = [];
                    (row.actions || []).map((act) => {
                        actions.push({label:act,value:act})
                    })
                    setNewRole_actions(actions)
                    console.log(actions)
                    setOpenUpdateModal(true)
                } }>
                    <EditIcon fontSize="small" color="primary" />
                </IconButton>
                <IconButton size="small" onClick={() => {
                    setDeleteMeth("role")
                    setSelectedRole(row)
                    setOpenDeleteModal(true)
                }}>
                    <DeleteIcon fontSize="small" color="error"/>
                </IconButton>
            </div> :
                <div style={{justifyContent:"center"}}>
                    <Popup content={
                        <h6 style={{fontSize:"0.8rem"}}>C'est un role par défaut: <br/>Vous ne pouvez pas le modifier ou le supprimer !</h6>
                    }
                           wide='very'
                           size={"small"}
                           trigger={<HelpIcon fontSize="small" color="disabled"/>}
                    />
                </div>

            ,
            grow:0.1,
            center:true
        },
        {
            name: 'Nom',
            cell: row => <div>
                <Label as='a' basic color='blue' size="mini">
                    {row.name}
                </Label>
            </div>,
            sortable: true,
            grow:0.3
        },
        {
            name: 'Actions',
            cell: row => <div>
                {
                    row.actions ?
                        row.actions.map(r => (
                            <Label as='a' color='blue' size="mini" style={{marginBottom:4}}>{r}</Label>
                        )) :
                        <CircularProgress color="primary" size={15} />
                }
            </div>,
            sortable: false,
        },
    ];

    const actions_columns = [
        {
            name: '',
            cell: row => row.type === "custom" ? <div>
                <IconButton onClick={() => {
                    setDeleteMeth("action")
                    setSelectedAction(row)
                    setOpenDeleteModal(true)
                }}>
                    <Trash/>
                </IconButton>
            </div> :
                <div style={{justifyContent:"center"}}>
                    <Popup content={
                        <h6 style={{fontSize:"0.8rem"}}>C'est une action par défaut: <br/>Vous ne pouvez pas la modifier ou la supprimer !</h6>
                    }
                           wide='very'
                           size={"small"}
                           trigger={<HelpIcon fontSize="small" color="disabled"/>}
                    />
                </div>
            ,
            grow:0.1,
            center:true
        },
        {
            name: 'Nom',
            cell: row => <div>
                <Label as='a' basic color='blue' size="mini">
                    {row.name}
                </Label>
            </div>,
            sortable: true,
            grow:0.3
        }
    ];

    const users_columns = [
        {
            name: 'Action',
            cell: row => <div>
                <div style={{justifyContent:"center"}}>
                    <Popup content={
                        <h6 style={{fontSize:"0.8rem"}}>la possibilité de modifier ou de supprimer cet utilisateur de ce registre est désactivé pour le moment !</h6>
                    }
                           wide='very'
                           size={"small"}
                           trigger={<HelpIcon fontSize="small" color="disabled"/>}
                    />
                </div>
            </div>,
            grow:0.5
        },
        {
            name: 'Username',
            selector: "username",
            sortable: true,
        },
        {
            name: 'Email',
            selector: "email",
            sortable: true,
        },
        {
            name: 'roles',
            cell: row => <div style={{paddingBottom:10}}>
                {
                    (row.roles || []).map( item => (
                        <Label as='a' basic color='blue' pointing size="mini">
                            {item.role}
                        </Label>
                    ))
                }
            </div>,
        }
    ];

    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = React.useState(true);
    const [loadingBtnAdd, setLoadingBtnAdd] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState("details");
    const [regInfo, setRegInfo] = React.useState({});
    const [roles, setRoles] = React.useState(null);
    const [actions, setActions] = React.useState([]);
    const [regUsers, setRegUsers] = React.useState([]);
    const [customActions, setCustomActions] = React.useState([]);
    const [newRole_name, setNewRole_name] = React.useState("");
    const [newAction_name, setNewAction_name] = React.useState("");
    const [newRole_actions, setNewRole_actions] = React.useState([]);
    const [openAddModal, setOpenAddModal] = React.useState(false);
    const [openAddUserModal, setOpenAddUserModal] = React.useState(false);
    const [newUserReg_email, setNewUserReg_email] = React.useState("");
    const [openUpdateModal, setOpenUpdateModal] = React.useState(false);
    const [openAddActionModal, setOpenAddActionModal] = React.useState(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

    const [expanded, setExpanded] = React.useState(false);
    const [regName, setRegName] = React.useState("");
    const [regState, setRegState] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState("");
    const [selectedAction, setSelectedAction] = React.useState("");
    const [deleteMeth, setDeleteMeth] = React.useState("");
    const [user_search, setUser_search] = React.useState("");

    const [openDeleteRegModal, setOpenDeleteRegModal] = React.useState(false);



    useEffect(() => {

            if(verifSession() === true){
                getInforegistre()
                getRoles()
                getActions()
                getRegistryUsers()
            }else{
                enqueueSnackbar('Session expirée', { variant:"warning" })
                enqueueSnackbar('Reconnexion en cours...', { variant:"info" })
                setTimeout(() => {
                    props.history.push("/sso/login")
                },2000)
            }


    }, [getInforegistre,getRoles,getActions,getRegistryUsers]);

    const verifSession = () => {
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    const getInforegistre = () => {
        SSO_service.get_info_registre(props.match.params.reg,localStorage.getItem("usrtoken")).then( infoRes => {
            console.log(infoRes)
            if(infoRes.status === 200 && infoRes.succes === true){
                setRegInfo(infoRes.data)
                setRegName(infoRes.data.name.main || "")
                setRegState(infoRes.data.open.main || false)
                setLoading(false)
            }else{
                enqueueSnackbar(infoRes.error, { variant:"error" })
                setLoading(false)
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            setLoading(false)
        })
    }

    const getRoles = () => {
        SSO_service.get_registre_roles(props.match.params.reg,localStorage.getItem("usrtoken")).then( rolesRes => {
            if(rolesRes.status === 200 && rolesRes.succes === true){
                let all_roles = [];
                let bultin_roles = rolesRes.data.builtin || []
                bultin_roles.map(item => {
                    all_roles.push({name:item,type:"builtin"})
                })
                let custom_roles = rolesRes.data.custom || []
                custom_roles.map(item => {
                    all_roles.push({name:item,type:"custom"})
                })
                let all_formated_roles = []
                all_roles.map((role,k) => {
                    SSO_service.getInfoRole(props.match.params.reg,role.name,localStorage.getItem("usrtoken")).then( infoRes => {
                        if(infoRes.status === 200 && infoRes.succes === true){
                            all_formated_roles.push({name:role.name,type:role.type,actions:infoRes.data[role.name].actions || []})
                        }else{
                            console.log(infoRes.error)
                            all_formated_roles.push({name:role.name,actions:[]})
                        }
                        setRoles(all_formated_roles)
                    }).catch(err => {
                        console.log(err)
                    })
                })
            }else{
                enqueueSnackbar(rolesRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const getActions = () => {
        SSO_service.get_registre_actions(props.match.params.reg,localStorage.getItem("usrtoken")).then( actionsRes => {
            if(actionsRes.status === 200 && actionsRes.succes === true){
                let all_actions = [];
                let bultin_actions = actionsRes.data.builtin || []
                bultin_actions.map(item => {
                    all_actions.push({name:item,type:"builtin"})
                })
                let custom_actions = actionsRes.data.custom || []
                custom_actions.map(item => {
                    all_actions.push({name:item,type:"custom"})
                })
                console.log(all_actions)
                let all_formated_actions = []
                all_actions.map((action,k) => {
                    all_formated_actions.push({name:Array.isArray(action) === true ? action[0].name : action.name,type:action.type})
                })
                setActions(all_formated_actions)
            }else{
                enqueueSnackbar(actionsRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const addNewRole = () => {
        console.log(role_actions)
        setOpenAddModal(false)
        setLoading(true)
        let actions = []
        role_actions.map((item,key) => {
            actions.push(item.value)
        })
        setLoadingBtnAdd(true)
        SSO_service.add_registre_role(props.match.params.reg,{roles:{[newRole_name] : {actions: actions}}},
            localStorage.getItem("usrtoken")).then(addRes => {
                console.log(addRes)
            if(addRes.status === 200 && addRes.succes === true){
                role_actions = []
                setNewRole_name("")
                getRoles()
                setTimeout(() => {
                    setLoading(false)
                    setLoadingBtnAdd(false)
                    setOpenAddModal(false)
                    enqueueSnackbar("L'ajout du nouveau role est effectué avec succès", { variant:"success" })
                },1500)


            }else{
                enqueueSnackbar(addRes.error, { variant:"error" })
                setLoadingBtnAdd(false)
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            setLoadingBtnAdd(false)
        })
    }

    const addNewAction = () => {
        setLoadingBtnAdd(true)
        SSO_service.add_registre_action(props.match.params.reg,{action:newAction_name},
            localStorage.getItem("usrtoken")).then(addRes => {
            console.log(addRes)
            if(addRes.status === 200 && addRes.succes === true){
                setNewAction_name("")
                getActions()
                setLoadingBtnAdd(false)
                setOpenAddActionModal(false)
                enqueueSnackbar("L'ajout de la nouvelle action est effectuée avec succès", { variant:"success" })

            }else{
                enqueueSnackbar(addRes.error, { variant:"error" })
                setLoadingBtnAdd(false)
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            setLoadingBtnAdd(false)
        })
    }

    const updateRegName = (id,data) => {
        setLoading(true)
        SSO_service.update_registre_name(id,data,localStorage.getItem("usrtoken")).then( updateRes => {
            if(updateRes.status === 200 && updateRes.succes === true){
                getInforegistre()
                enqueueSnackbar("Modification effectuée avec succès", { variant:"success" })
            }else{
                setLoading(false)
                enqueueSnackbar(updateRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoading(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const updateRegState = (id,data) => {
        setLoading(true)
        SSO_service.update_registre_state(id,data,localStorage.getItem("usrtoken")).then( updateRes => {
            if(updateRes.status === 200 && updateRes.succes === true){
                getInforegistre()
                enqueueSnackbar("Modification effectuée avec succès", { variant:"success" })
            }else{
                setLoading(false)
                enqueueSnackbar(updateRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoading(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const updateRegRole = (id_role,data) => {
        setOpenUpdateModal(false)
        setLoading(true)
        SSO_service.update_registre_role(props.match.params.reg,id_role,data,localStorage.getItem("usrtoken")).then( updateRes => {
            console.log(updateRes)
            if(updateRes.status === 200 && updateRes.succes === true){
                getRoles()
                setTimeout(() => {
                    setLoading(false)
                    enqueueSnackbar("Modification effectuée avec succès", { variant:"success" })
                },500)

            }else{
                setLoading(false)
                enqueueSnackbar(updateRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoading(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const deleteRole = (id_reg,id_role) => {
        setOpenDeleteModal(false)
        setLoading(true)
        SSO_service.remove_registre_role(id_reg,id_role,localStorage.getItem("usrtoken")).then( remRes => {
            if(remRes.status === 200 && remRes.succes === true){
                getRoles()
                setTimeout(() => {
                    setLoading(false)
                    enqueueSnackbar("Suppression effectuée avec succès", { variant:"success" })
                },1000)

            }else{
                setLoading(false)
                enqueueSnackbar(remRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoading(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const deleteAction = (id_reg,id_action) => {
        setOpenDeleteModal(false)
        setLoading(true)
        SSO_service.remove_registre_action(id_reg,id_action,localStorage.getItem("usrtoken")).then( remRes => {
            if(remRes.status === 200 && remRes.succes === true){
                getActions()
                setTimeout(() => {
                    setLoading(false)
                    enqueueSnackbar("Suppression effectuée avec succès", { variant:"success" })
                },2000)
            }else{
                setLoading(false)
                enqueueSnackbar(remRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoading(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const addNewUserToReg = (email,roles) => {
        setLoadingBtnAdd(true)

        let formated_roles = [];
        roles.map( item => {
            formated_roles.push(item.value)
        })

        SSO_service.add_user_to_reg(props.match.params.reg,{email:email,roles:formated_roles},localStorage.getItem("usrtoken")).then( addRes => {
            if(addRes.status === 200 && addRes.succes === true){
                new_user_roles = [];
                setNewUserReg_email("");
                getRegistryUsers();
                setTimeout(() => {
                    setOpenAddUserModal(false)
                    setLoadingBtnAdd(false)
                    enqueueSnackbar("L'ajout du nouveau utilisateur est effectué avec succès", { variant:"success" })
                },1500)
            }else{
                enqueueSnackbar(addRes.error, { variant:"error" })
                setLoadingBtnAdd(false)
            }
        }).catch( err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            setLoadingBtnAdd(false)
        })

    }

    const getRegistryUsers = () => {

        SSO_service.getRegistryUsers(props.match.params.reg,localStorage.getItem("usrtoken")).then(regUsersRes => {
            console.log(regUsersRes)
            if(regUsersRes.status === 200 && regUsersRes.succes === true){
                let users = [];
                let users_ids_roles = [];
                (regUsersRes.data.users).map( item => {
                    users_ids_roles.push({id:item.user.id,roles:item.user.roles || {}})
                })
                users_ids_roles.map( item => {
                    SSO_service.getAdminUserInfo(item.id,localStorage.getItem("usrtoken")).then( infoRes => {
                        if(infoRes.status === 200 && infoRes.succes === true){
                            let roles_object = item.roles || {}
                            const roles_array = [];
                            Object.keys(roles_object).forEach(key => roles_array.push({
                                role: key,
                                data: roles_object[key]
                            }));
                            users.push({  
                                id:item.id,
                                email:infoRes.data.email,
                                username:infoRes.data.username,
                                roles:roles_array
                            })
                            setRegUsers(users)
                        }
                    })
                })
            }else{
                enqueueSnackbar(regUsersRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
        })
    }

    const getTabContent = () => {

        if(selectedTab === "details"){
            return (
                <div style={{marginTop:50}}>
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} >
                        <AccordionSummary
                            expandIcon={<EditIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography className={classes.heading}>Nom du registre</Typography>
                            <div>
                                {
                                    !loading &&
                                        [
                                            <Typography className={classes.secondaryHeadingTitle}>{regInfo.name.main}</Typography>,
                                            <Typography className={classes.secondaryHeading}>
                                                {
                                                    regInfo.name.last_update ? ("Dernière modification: " + moment(regInfo.name.last_update).format("DD-MM-YYYY HH:mm")) : ""
                                                }
                                            </Typography>
                                        ]
                                }
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="row mt-2">
                                <div className="col-md-12 mt-1">
                                    <TextField
                                        label="Nom du registre"
                                        variant="outlined"
                                        size="small"
                                        style={{width:"100%"}}
                                        value={regName}
                                        onChange={(e) => {setRegName(e.target.value)}}
                                    />
                                </div>
                            </div>
                            <div className="row mt-4">
                                <div className="col-md-12">
                                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                                        <Button color="primary" style={{textTransform:"none"}}
                                                onClick={handleChange('panel1')}>Annuler</Button>
                                        <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                                onClick={() => {
                                                    updateRegName(props.match.params.reg,{name:regName})
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
                    <Accordion expanded={expanded === 'panel2'}>
                        <AccordionSummary
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Typography className={classes.heading}>Description</Typography>
                            <div>
                                {
                                    !loading &&
                                        [
                                            <Typography style={{marginLeft:-13}} className={classes.secondaryHeadingTitle}>{regInfo.description.main || "Aucune description"}</Typography>,
                                            <Typography className={classes.secondaryHeading} style={{marginLeft:-13}}>
                                                {
                                                    regInfo.description.last_update ? ("Dernière modification: " + moment(regInfo.description.last_update).format("DD-MM-YYYY HH:mm")) : ""
                                                }
                                            </Typography>
                                        ]
                                }
                            </div>
                        </AccordionSummary>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <AccordionSummary
                            expandIcon={<EditIcon />}
                            aria-controls="panel1bh-content"
                            id="panel3bh-header"
                        >
                            <Typography className={classes.heading}>Statut</Typography>
                            <div>
                                {
                                    !loading &&
                                    [
                                        <Typography className={classes.secondaryHeadingTitle}>{regInfo.open.main === true ? "Ouvert" : "Privé"}</Typography>,
                                        <Typography className={classes.secondaryHeading}>
                                            {
                                                regInfo.open.last_update ? ("Dernière modification: " + moment(regInfo.open.last_update).format("DD-MM-YYYY HH:mm")) : ""
                                            }
                                        </Typography>
                                    ]
                                }
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="row mt-3">
                                <div className="col-md-12 mt-1">
                                    <h6>Choisissez qui peut voir votre registre</h6>
                                    <ButtonGroup color="primary" aria-label="outlined primary button group"
                                                 tabIndex={0} style={{marginTop:10}}
                                    >
                                        <Button style={{textTransform:"none"}}
                                                className={regState === false ? "selectedBtnGroup no-focus" : "no-focus"}
                                                startIcon={<LockOutlinedIcon />}
                                                onClick={() => {setRegState(false)}}
                                        >Vous uniquement</Button>
                                        <Button style={{textTransform:"none"}}
                                                className={regState === true ? "selectedBtnGroup no-focus" : "no-focus"}
                                                startIcon={<GroupOutlinedIcon />}
                                                onClick={() => {setRegState(true)}}
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
                                                    updateRegState(props.match.params.reg,{open:regState})
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
                    <Accordion>
                        <AccordionSummary
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography className={classes.heading}>Date de création</Typography>
                            <div>
                                {
                                    !loading &&
                                    <Typography style={{marginLeft:-13}} className={classes.secondaryHeadingTitle}>{moment(regInfo.date).format("DD-MM-YYYY HH:mm")}</Typography>
                                }
                            </div>
                        </AccordionSummary>
                    </Accordion>
                </div>

            )
        }

        if (selectedTab === 'roles') {
            return (
                <div style={{marginLeft:20,marginTop:15}}>
                    <div style={{marginTop:20}}/>
                    <div style={{marginTop:20}}>
                        <div align="right">
                            <AtlButton appearance="default" className="alt-font"
                                       iconBefore={<AddIcon/>}
                                       onClick={() => {
                                           setOpenAddModal(true)
                                       }}
                            >
                                Ajouter un role
                            </AtlButton>
                        </div>
                        <DataTable
                            columns={roles_columns}
                            data={roles}
                            defaultSortField={"name"}
                            selectableRows={false}
                            selectableRowsHighlight={true}
                            pagination={true}
                            paginationPerPage={10}
                            paginationComponentOptions={paginationOptions}
                            highlightOnHover={false}
                            contextMessage={tableContextMessage}
                            progressPending={!roles}
                            progressComponent={<h6>Chargement...</h6>}
                            noDataComponent="Il n'y a aucun role à afficher"
                            noHeader={true}
                            pointerOnHover={true}
                            onRowClicked={(row, e) => {}}
                            customStyles={customTableStyle}
                        />
                    </div>
                </div>
            )
        }

        if (selectedTab === 'actions') {
            return (
                <div style={{marginLeft:20,marginTop:15}}>
                    <div style={{marginTop:20}}/>
                    <div style={{marginTop:20}}>
                        <div align="right">
                            <AtlButton appearance="default" className="alt-font"
                                       iconBefore={<AddIcon/>}
                                       onClick={() => {
                                           setOpenAddActionModal(true)
                                       }}
                            >
                                Ajouter une action
                            </AtlButton>
                        </div>
                        <DataTable
                            columns={actions_columns}
                            data={actions}
                            selectableRows={false}
                            selectableRowsHighlight={true}
                            pagination={true}
                            paginationPerPage={10}
                            paginationComponentOptions={paginationOptions}
                            highlightOnHover={false}
                            contextMessage={tableContextMessage}
                            progressPending={!actions}
                            progressComponent={<h6>Chargement...</h6>}
                            noDataComponent="Il n'y a aucune action à afficher"
                            noHeader={true}
                            pointerOnHover={true}
                            onRowClicked={(row, e) => {}}
                            customStyles={customTableStyle}
                        />
                    </div>
                </div>
                /*<div style={{marginLeft:20,marginTop:15}}>
                    <div style={{marginTop:20}}>
                        <h6>Actions par dèfaut:</h6>
                        <Paper component="ul" className={classes.root}>
                            {actions.map((role,key) => {
                                return (
                                    <li key={key}>
                                        <Chip
                                            color="primary"
                                            icon={<CheckCircleIcon/>}
                                            label={role}
                                            className={classes.chip}
                                        />
                                    </li>
                                );
                            })}
                        </Paper>
                    </div>
                    <div style={{marginTop:20}}>
                        <h6>Autres actions</h6>
                        <div align="right">
                            <AtlButton appearance="default" className="alt-font"
                                       iconBefore={<AddIcon/>}
                                       onClick={() => {
                                           setOpenAddActionModal(true)
                                       }}
                            >
                                Ajouter une action
                            </AtlButton>
                        </div>
                        <DataTable
                            columns={actions_columns}
                            data={customActions}
                            selectableRows={false}
                            selectableRowsHighlight={true}
                            pagination={true}
                            paginationPerPage={10}
                            paginationComponentOptions={paginationOptions}
                            highlightOnHover={false}
                            contextMessage={tableContextMessage}
                            progressPending={!customActions}
                            progressComponent={<h6>Chargement...</h6>}
                            noDataComponent="Il n'y a aucune autre action à afficher"
                            noHeader={true}
                            pointerOnHover={true}
                            onRowClicked={(row, e) => {}}
                            customStyles={customTableStyle}
                        />
                    </div>


                </div>*/
            )
        }

        if(selectedTab === "users"){
            return (
                <div style={{marginLeft:20,marginTop:35}}>
                    <div align="right" style={{marginBottom:30}}>
                        <AtlButton appearance="default" className="alt-font"
                                   iconBefore={<AddIcon/>}
                                   onClick={() => {
                                       setOpenAddUserModal(true)
                                   }}
                        >
                            Ajouter un utilisateur
                        </AtlButton>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <Textfield name="basic" placeholder="Chercher..." style={{maxWidth:350}}
                                       value={user_search} onChange={event => setUser_search(event.target.value)}
                            />
                        </div>
                    </div>
                    <DataTable
                        columns={users_columns}
                        data={regUsers.filter(x => (x.username.indexOf(user_search) > -1)  || (x.email.indexOf(user_search) > -1) || user_search === "" ) }
                        selectableRows={false}
                        selectableRowsHighlight={true}
                        pagination={true}
                        paginationPerPage={10}
                        paginationComponentOptions={paginationOptions}
                        highlightOnHover={false}
                        contextMessage={tableContextMessage}
                        progressPending={!regUsers}
                        progressComponent={<h6>Chargement...</h6>}
                        noDataComponent="Il n'y a aucun utilisateur à afficher"
                        noHeader={true}
                        pointerOnHover={true}
                        onRowClicked={(row, e) => {}}
                        customStyles={customTableStyle}
                    />
                </div>
            )
        }
    }

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleChangedTab = (event, selected) => {
        setSelectedTab(selected)
    }


    const deleteRegistre = (id) => {
        setLoadingBtnAdd(true)
        SSO_service.remove_registre(id,localStorage.getItem("usrtoken")).then(delRes => {
            if(delRes.status === 200 && delRes.succes === true){
                setOpenDeleteModal(false)
                setTimeout(() => {
                    setLoadingBtnAdd(false)
                    enqueueSnackbar("Registre supprimé avec succès", { variant:"success" })
                    setTimeout(() => {
                        props.history.goBack()
                    },500)
                },1500)
            }else{
                setLoadingBtnAdd(false)
                enqueueSnackbar(delRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoadingBtnAdd(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }


    return(

        <div>
            <MuiBackdrop open={loading}/>
            <div className="container container-lg" style={{marginTop:50}}>
                <div className="info_form">
                    <div>
                        <div className="main_padding-form">
                            <div align="right" style={{marginTop:-10}}>
                                <IconButton onClick={() => {
                                    setOpenDeleteRegModal(true)
                                }}>
                                    <Trash/>
                                </IconButton>
                            </div>
                            <h5 style={{fontSize:"1.25rem",marginTop:-33}}>Registre: {!loading && regInfo.name.main}</h5>
                            <div style={{display:"flex"}}>
                                <label style={{color:"#5f6368",fontSize:12,marginRight:10,marginTop:2}}>{!loading && regInfo.open.main === true ? "Ouvert":"Privé"}</label>
                                <Popup content={
                                    <h6 style={{fontSize:"0.8rem"}}>Statut de votre registre: <br/> Privé: uniquement sur invitation des membre avec l'action <b>invite</b> <br/>Publique: tout le monde peu rejoindre votre registre, il apparait dans la liste des registres </h6>
                                }
                                       wide='very'
                                       size={"small"}
                                       trigger={<HelpIcon fontSize="small" color="disabled"/>}
                                />

                            </div>


                            <div className="rainbow-flex rainbow-flex_column rainbow_vertical-stretch mt-5">
                                <Tabset
                                    fullWidth
                                    id="tabset-1"
                                    onSelect={handleChangedTab}
                                    activeTabName={selectedTab}
                                    className="rainbow-p-horizontal_x-large"
                                >
                                    <Tab
                                        label="Détails"
                                        name="details"
                                        id="details"
                                        ariaControls="details"
                                    />

                                    <Tab
                                        label="Roles"
                                        name="roles"
                                        id="roles"
                                        ariaControls="roles"
                                    />

                                    <Tab label="Actions" name="actions" id="actions" ariaControls="actions" />
                                    <Tab label="Utilisateurs" name="users" id="users" ariaControls="users" />

                                </Tabset>
                                {/*<Divider style={{marginTop:20,marginBottom:20}}/>*/}
                                {getTabContent()}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <ModalTransition>
                {openAddModal && (
                    <Modal
                        width="medium"
                        actions={[
                            { text: 'Ajouter', className:"alt-font", onClick: () => {addNewRole()}, isLoading:loadingBtnAdd, isDisabled:newRole_name.trim() === "" },
                            { text: 'Annuler', className:"alt-font", onClick: () => {setOpenAddModal(false)} },
                        ]}
                        onClose={() => {
                            setOpenAddModal(false)
                        }}
                        heading="Ajouter un nouveau role"
                        components={{
                            Body: () => (
                                <div style={{padding:"2px 20px 20px 30px"}}>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <TextField
                                                label="Role"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                value={newRole_name}
                                                autoFocus={true}
                                                onChange={(e) => {setNewRole_name(e.target.value)}}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <h6 style={{marginTop:10,marginBottom:10}} className="alt-font">Liste des actions</h6>
                                            <Checkbox
                                                className="checkbox-select"
                                                classNamePrefix="select"
                                                options={
                                                    (actions || []).map((item) =>
                                                        ({
                                                            value: item.name,
                                                            label:item.name
                                                        }))
                                                }
                                                onChange={value => {
                                                    role_actions = value
                                                }}
                                                placeholder="actions"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        }}
                    >

                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openAddUserModal && (
                    <Modal
                        width="medium"
                        actions={[
                            { text: 'Ajouter', className:"alt-font", onClick: () => {addNewUserToReg(newUserReg_email,new_user_roles)}, isLoading:loadingBtnAdd, isDisabled:newUserReg_email.trim() === "" || verifForms.verif_Email(newUserReg_email) },
                            { text: 'Annuler', className:"alt-font", onClick: () => {setOpenAddUserModal(false)} },
                        ]}
                        onClose={() => {
                            setOpenAddUserModal(false)
                        }}
                        heading="Ajouter un nouveau utilisateur à ce registre"
                        components={{
                            Body: () => (
                                <div style={{padding:"2px 20px 20px 30px"}}>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <TextField
                                                label="Adresse mail"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                value={newUserReg_email}
                                                autoFocus={true}
                                                onChange={(e) => {setNewUserReg_email(e.target.value)}}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <h6 style={{marginTop:10,marginBottom:10}} className="alt-font">Liste des roles</h6>
                                            <Checkbox
                                                className="checkbox-select"
                                                classNamePrefix="select"
                                                options={
                                                    (roles || []).map((item) =>
                                                        ({
                                                            value: item.name,
                                                            label:item.name
                                                        }))
                                                }
                                                onChange={value => {
                                                    new_user_roles = value
                                                }}
                                                placeholder="roles"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        }}
                    >

                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openUpdateModal && (
                    <Modal
                        width="medium"
                        actions={[
                            { text: 'Modifier', className:"alt-font",
                                onClick: () => {updateRegRole(selectedRole.name,{name:newRole_name,actions:newRole_actions.map((item) => (item.value)) })},
                                isLoading:loadingBtnAdd },
                            { text: 'Annuler', className:"alt-font", onClick: () => {setOpenUpdateModal(false)} },
                        ]}
                        onClose={() => {
                            setOpenUpdateModal(false)
                        }}
                        heading="Modifier"
                        components={{
                            Body: () => (
                                <div style={{padding:"2px 20px 20px 30px"}}>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <TextField
                                                label="Role"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                value={newRole_name}
                                                //autoFocus={true}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <h6 style={{marginTop:10,marginBottom:10}} className="alt-font">Liste des actions</h6>
                                            <Checkbox
                                                className="checkbox-select"
                                                classNamePrefix="select"
                                                options={
                                                    (actions || []).map((item) =>
                                                        ({
                                                            value: item.name,
                                                            label:item.name,
                                                        }))
                                                }
                                                value={newRole_actions || []}
                                                onChange={value => {
                                                    console.log(value)
                                                    setNewRole_actions(value)
                                                }}
                                                placeholder="actions"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        }}
                    >

                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openAddActionModal && (
                    <Modal
                        width="medium"
                        actions={[
                            { text: 'Ajouter', className:"alt-font", onClick: () => {addNewAction()}, isLoading:loadingBtnAdd, isDisabled:newAction_name.trim() === "" },
                            { text: 'Annuler', className:"alt-font", onClick: () => {setOpenAddActionModal(false)} },
                        ]}
                        onClose={() => {
                            setOpenAddActionModal(false)
                        }}
                        heading="Ajouter une nouvelle action"
                        components={{
                            Body: () => (
                                <div style={{padding:"2px 20px 20px 30px"}}>
                                    <div className="row mt-2">
                                        <div className="col-md-8 mt-1">
                                            <TextField
                                                label="Action"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                value={newAction_name}
                                                autoFocus={true}
                                                onChange={(e) => {setNewAction_name(e.target.value)}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        }}
                    >

                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openDeleteModal === true && (
                    <Modal
                        actions={[
                            { text: 'Supprimer', onClick: () => {
                                deleteMeth === "role" ? deleteRole(props.match.params.reg,selectedRole.name) :
                                    deleteAction(props.match.params.reg,selectedAction.name)}},
                            { text: 'Annuler', onClick: () => {
                                    setOpenDeleteModal(false)
                                }},
                        ]}
                        onClose={() => {
                            setOpenDeleteModal(false)
                        }}
                        heading={deleteMeth === "role" ? "Vous êtes sur le point de supprimer ce role" : "Vous êtes sur le point de supprimer cette action"}
                        appearance="danger"
                    >
                    </Modal>
                )}
            </ModalTransition>

            <ModalTransition>
                {openDeleteRegModal === true && (
                    <Modal
                        actions={[
                            { text: 'Supprimer', onClick: () => {deleteRegistre(props.match.params.reg)}},
                            { text: 'Annuler', onClick: () => {
                                    setOpenDeleteRegModal(false)
                                }},
                        ]}
                        onClose={() => {
                            setOpenDeleteRegModal(false)
                        }}
                        heading="Vous êtes sur le point de supprimer ce registre !"
                        appearance="danger"
                    >
                    </Modal>
                )}
            </ModalTransition>


        </div>
    )

}
