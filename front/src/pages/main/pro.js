import React,{useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import SSO_service from "../../provider/SSO_service";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import '../../assets/css/phone-input2-material.css'
import moment from "moment";
import { useSnackbar } from 'notistack';
import { Tabset, Tab, ButtonGroup, ButtonIcon } from 'react-rainbow-components';
import {Divider, IconButton} from "@material-ui/core";
import DataTable from 'react-data-table-component';
import {paginationOptions,tableContextMessage} from '../../constants/defaultValues';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import AtlButton from '@atlaskit/button';
import {Edit,Trash} from '../../components/icons';
import Modal, {ModalTransition} from "@atlaskit/modal-dialog";
import TextField from "@material-ui/core/TextField";
import Textfield from "@atlaskit/textfield";
import {Label, Popup} from "semantic-ui-react";
import HelpIcon from "@material-ui/icons/Help";
import jwt_decode from "jwt-decode";
import utilFunctions from "../../tools/functions";
import PQueue from "p-queue";

export default function Pro(props){

    const columns = [
        {
            name: 'Nom',
            selector: 'name',
            sortable: true,
        },
        {
            name: 'roles',
            cell: row => <div style={{paddingBottom:10}}>
                {
                    (row.roles || []).map( item => (
                        item.data.active === true ?
                            <Popup content={<h6 style={{fontSize: "0.8rem"}}>Modifié
                                par: {item.data.by === null ? "system" : item.data.by}
                                <br/>{item.data.last_update !== null && moment(item.data.last_update).format("DD-MM-YYYY HH:mm")}
                            </h6>}
                                   trigger={
                                       <Label as='a' basic color="blue" size="mini"
                                              style={{marginBottom: 2, marginTop: 5}}>
                                           {item.role}
                                       </Label>
                                   }
                                   wide='very'
                                   size={"small"}
                            /> :
                            <Popup content={<h6 style={{fontSize: "0.8rem"}}>Rôle désactivé
                            </h6>}
                                   trigger={
                                       <Label as='a' size="mini" style={{marginBottom: 2, marginTop: 5}}>
                                           {item.role}
                                           {/*<Icon name='lock'/>*/}
                                       </Label>
                                   }
                                   wide='very'
                                   size={"small"}
                            />
                    ))
                }
            </div>,
        },
        {
            name: 'Date de création',
            selector: 'last_update',
            cell: row => moment(row.date).format("DD-MM-YYYY HH:mm"),
            sortable: true,
        },
        {
            name: 'Dernière modification',
            selector: 'date',
            cell: row => moment(row.date).format("DD-MM-YYYY HH:mm"),
            sortable: true,
        },
        /*{
            name: 'Action',
            cell: row => <div>
                {/!*<IconButton>
                    <Edit />
                </IconButton>*!/}
                <IconButton onClick={() => {
                    setSelectedRegId(row.id)
                    setOpenDeleteModal(true)
                }}>
                    <Trash/>
                </IconButton>
            </div>,
            grow:0.5
        },*/


    ];

    const other_reg_columns = [
        {
            name: 'Créateur',
            cell: row => <div>{row.creator}</div>,
            sortable: true,
            grow:0.4
        },
        {
            name: 'roles',
            cell: row => <div style={{paddingBottom:10}}>
                {
                    (row.roles || []).map( item => (
                        <Label as='a' basic color='blue' size="mini">
                            {item.role}
                        </Label>
                    ))
                }
            </div>,
        },
        {
            name: 'Nom',
            selector: 'name',
            sortable: true,
            grow:0.45
        },
        {
            name: 'Dernière modification',
            selector: 'date',
            cell: row => moment(row.date).format("DD-MM-YYYY HH:mm"),
            sortable: true,
            grow:0.4
        }
    ];


    const { enqueueSnackbar } = useSnackbar();
    const [is_have_acces_to_search_users, setIs_have_acces_to_search_users] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [loadingBtnAdd, setLoadingBtnAdd] = React.useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState((props.history.location.hash && props.history.location.hash.trim() !== "") ? props.history.location.hash.substring(1) : "registries");
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [openAddModal, setOpenAddModal] = React.useState(false);
    const [newReg_name, setNewReg_name] = React.useState("");
    const [registres, setRegistres] = React.useState();
    const [other_registres, setOther_registres] = React.useState();
    const [registries_logs, setRegistries_logs] = React.useState();
    const [selectedRegId, setSelectedRegId] = React.useState("");
    const [user_search_input, setUser_search_input] = React.useState("");
    const [admin_users, setAdmin_users] = React.useState();
    const [updateScreen, setUpdateScreen] = React.useState(false);


    useEffect( async () => {

            if(utilFunctions.verif_session() === true){
                verif_acces_roles().then( r => {
                    if(r === true){
                        getCurrentUserRegistres()
                    }
                })
                getOtherUserRegistres()
                await getRegistriesLogs()

            }else{
                /*if(props.history.location.pathname && props.history.location.pathname.trim() !== "" && props.history.location.pathname.length > 1){
                    let path = props.history.location.pathname + ((props.history.location.hash && props.history.location.hash.trim() !== "") ? props.history.location.hash :"" )
                    props.history.push("/sso/login?" + path)
                }else{
                    props.history.push("/sso/login")
                }*/
            }
    }, []);

    const verif_acces_roles = () => {
        return new Promise(async (resolve, reject) => {
            let roles = JSON.parse(localStorage.getItem("roles")) || []
            console.log(roles)
            if(roles.find(x => x.role === "admin" || x.role === "creator")){
                setIs_have_acces_to_search_users(true)
                resolve(true)
            }else{
                resolve(false)
            }
        })
    }

    const getCurrentUserRegistres = () => {
        setLoading(true)
        SSO_service.get_created_user_registies(localStorage.getItem("usrtoken")).then(res => {
            console.log(res)
            if(res.status === 200 && res.succes === true){

                let registries = res.data.registries || [];
                let formated_regs = []
                registries.map((reg,key) => {

                    let roles_object = reg.registry.roles || {}
                    const roles_array = [];
                    Object.keys(roles_object).forEach(key => roles_array.push({
                        role: key,
                        data: roles_object[key]
                    }));

                    formated_regs.push({
                        id:reg.registry.id,
                        name:reg.registry.name.main,
                        date:reg.date,
                        last_update:reg.last_update,
                        roles:roles_array
                    })

                })
                setLoading(false)
                setRegistres(formated_regs)
            }else{
                enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const getRegistriesLogs = () => {
        return new Promise(resolve => {

            SSO_service.getRegistriesLogs(localStorage.getItem("usrtoken")).then( logsRes => {
                if(logsRes.status === 200 && logsRes.succes === true){
                    let formated_data = []
                    let data = Object.values(logsRes.data)
                    data.map( item => {
                        let formated = Object.values(item)
                        formated.map( elem => {
                            let formated2 = Object.values(elem)
                            formated2.map( elem2 => {
                                let formated3 = Object.values(elem2)
                                formated3.map( elem3 => {
                                    let val = Object.values(elem3)
                                    formated_data.push(val)
                                })
                            })

                        })
                    })
                    let devicesData = []
                    formated_data.map( (device,i1) => {
                        devicesData.push({
                            ["device"+i1]:device
                        })
                    })
                    devicesData.map( (item,i) => {
                        item.map( (item1,i1) => {

                        })
                    })




                    setRegistries_logs(logsRes.data)
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

    const getOtherUserRegistres = () => {
        setLoading(true)
        SSO_service.get_user_registry(localStorage.getItem("usrtoken")).then(res => {

            if(res.status === 200 && res.succes === true){

                if(res.data.registries && res.data.registries.length === 0){
                    setLoading(false)
                    setOther_registres([])
                }else{
                    let o_registries = res.data.registries || [];
                    let formated_regs = []

                    let queue = new PQueue({concurrency: 1});
                    let calls = [];

                    o_registries.map((reg,key) => {

                        let roles_object = reg.registry.roles || {}
                        const roles_array = [];
                        Object.keys(roles_object).forEach(key => roles_array.push({
                            role: key,
                            data: roles_object[key]
                        }));

                        calls.push(
                            () => SSO_service.getUserInfo(reg.by,localStorage.getItem("usrtoken")).then( infoRes => {
                                if (infoRes.status === 200 && infoRes.succes === true) {
                                    formated_regs.push({
                                        id:reg.registry.id,
                                        name:reg.registry.name.main,
                                        date:reg.date,
                                        last_update:reg.last_update,
                                        roles:roles_array,
                                        creator:infoRes.data.username
                                    })
                                }
                            })
                        )
                    })

                    queue.addAll(calls).then(final => {
                        setOther_registres(formated_regs)
                        console.log(formated_regs)
                        setLoading(false)
                    }).catch(err => {
                        console.log(err)
                        setLoading(false)
                    })
                }
            }else{
                enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const addNewRegistre = () => {
        setLoadingBtnAdd(true)
        SSO_service.add_registre({name: newReg_name, actions: [], roles: {}},localStorage.getItem("usrtoken")).then( addRes => {
            console.log(addRes)
            if(addRes.status === 200 && addRes.succes === true){
                getCurrentUserRegistres()
                setTimeout(() => {
                    setLoadingBtnAdd(false)
                    setOpenAddModal(false)
                    enqueueSnackbar("L'ajout du nouveau registre est effectué avec succès", { variant:"success" })
                },500)
            }else{
                setLoadingBtnAdd(false)
                enqueueSnackbar(addRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
            setLoadingBtnAdd(false)
            enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
        })
    }

    const deleteRegistre = (id) => {
        setLoadingBtnAdd(true)
        SSO_service.remove_registre(id,localStorage.getItem("usrtoken")).then(delRes => {
            if(delRes.status === 200 && delRes.succes === true){
                setOpenDeleteModal(false)
                setTimeout(() => {
                    setLoadingBtnAdd(false)
                    enqueueSnackbar("Registre supprimé avec succès", { variant:"success" })
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

    const admin_search_users = (query) => {
        setLoadingBtnSearch(true)
        setLoading(true)
        SSO_service.admin_users_search(query,localStorage.getItem("usrtoken")).then(searchRes => {
            console.log(searchRes)
            if(searchRes.status === 200 && searchRes.succes === true){
                let formated_users = [];
                (searchRes.data.users || []).map( item => {
                    SSO_service.getAdminUserInfo(item,localStorage.getItem("usrtoken")).then( infoRes => {
                        console.log(infoRes)
                        if(infoRes && infoRes.status === 200 && infoRes.succes === true){
                            let roles_object = infoRes.data.roles || {}
                            const roles_array = [];
                            Object.keys(roles_object).forEach(key => roles_array.push({
                                role: key,
                                data: roles_object[key]
                            }));
                            SSO_service.get_admin_user_registries(item,localStorage.getItem("usrtoken")).then( regsRes => {
                                if(regsRes && regsRes.status === 200 && regsRes.succes === true){
                                    formated_users.push({
                                        id:item,
                                        email:infoRes.data.email,
                                        username:infoRes.data.username,
                                        roles:roles_array,
                                        registries:regsRes.data.registries || []
                                    })
                                    setAdmin_users(formated_users)
                                }else{
                                    console.log(regsRes ? regsRes.error : "500 error")
                                }
                            })
                        }else{
                            console.log(infoRes ? infoRes.error : "500 error")
                        }
                    })
                })
                setTimeout(() => {
                    setLoading(false)
                    setLoadingBtnSearch(false)
                },1500)
            }else{
                console.log(searchRes.error)
            }
        }).catch(err => {
            console.log(err)
        })
    }

    const getTabContent = () => {

        if (selectedTab === 'registries') {
            return (
                <div style={{marginLeft:20}}>

                    <DataTable
                        columns={other_reg_columns}
                        data={other_registres}
                        defaultSortField="name"
                        selectableRows={false}
                        selectableRowsHighlight={true}
                        /*onSelectedRowsChange={selected => {
                            console.log(selected)
                        }}*/
                        pagination={true}
                        paginationPerPage={10}
                        paginationComponentOptions={paginationOptions}
                        highlightOnHover={false}
                        contextMessage={tableContextMessage}
                        progressPending={other_registres === null || other_registres === undefined}
                        progressComponent={<h6>Chargement...</h6>}
                        noDataComponent="Il n'y a aucun enregistrement à afficher"
                        noHeader={true}
                        pointerOnHover={true}
                        onRowClicked={(row, e) => {
                            props.history.push("/main/pro/registre/" + row.id + "#details" )
                        }}
                    />

                </div>
            )
        }
        if(selectedTab === 'me'){
            return (
                <div>
                    <div style={{marginLeft:20}}>
                        <div align="right">
                            <AtlButton appearance="default" className="alt-font"
                                       iconBefore={<AddIcon/>}
                                       onClick={() => {
                                           setOpenAddModal(true)
                                       }}
                            >
                                Ajouter un registre
                            </AtlButton>
                        </div>
                        <div style={{marginTop:20}}>
                            <DataTable
                                columns={columns}
                                data={registres}
                                defaultSortField="name"
                                selectableRows={false}
                                selectableRowsHighlight={true}
                                /*onSelectedRowsChange={selected => {
                                    console.log(selected)
                                }}*/
                                pagination={true}
                                paginationPerPage={10}
                                paginationComponentOptions={paginationOptions}
                                highlightOnHover={false}
                                contextMessage={tableContextMessage}
                                progressPending={registres === null || registres === undefined}
                                progressComponent={<h6>Chargement...</h6>}
                                noDataComponent="Il n'y a aucun enregistrement à afficher"
                                noHeader={true}
                                pointerOnHover={true}
                                onRowClicked={(row, e) => {
                                    props.history.push("/main/pro/registre/" + row.id + "#details" )
                                }}
                            />
                        </div>


                    </div>
                </div>
            )
        }
    }

    const handleChangedTab = (event, selected) => {
        setSelectedTab(selected)
        props.history.push("/main/registres#" + selected)
    }

    return(

        <div>
            <MuiBackdrop open={loading}/>
            <div className="container container-lg" style={{marginTop:50}}>
                <div className="info_form">
                    <div>
                        <div className="main_padding-form">

                            <h5 style={{fontSize:"1.25rem"}}>Mes registres</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Votre interface pour gérer vos registres</label>

                            <div className="rainbow-flex rainbow-flex_column rainbow_vertical-stretch mt-5">
                                <Tabset
                                    fullWidth
                                    id="tabset-1"
                                    onSelect={handleChangedTab}
                                    activeTabName={selectedTab}
                                    className="rainbow-p-horizontal_x-large"
                                >
                                    <Tab
                                        label="Les registres que vous concernent"
                                        name="registries"
                                        id="registries"
                                        ariaControls="primaryTab"
                                    />
                                    {
                                        is_have_acces_to_search_users === true &&
                                        <Tab label="Vos propres registres"
                                             name="me" id="me" ariaControls="me" />
                                    }

                                </Tabset>
                                <Divider style={{marginTop:20,marginBottom:20}}/>
                                {getTabContent()}
                            </div>

                        </div>
                    </div>

                </div>

                <div className="info_form">
                    <div>
                        <div className="main_padding-form">
                            <h5 style={{fontSize:"1.25rem"}}>Logs</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Quelques détails concernant l'activité sur vos registres</label>

                        </div>
                    </div>
                </div>
            </div>


            <ModalTransition>
                {openAddModal && (
                    <Modal
                        scrollBehavior={false}
                        width="medium"
                        actions={[
                            { text: 'Ajouter', className:"alt-font", onClick: () => {addNewRegistre()}, isLoading:loadingBtnAdd, style:{backgroundColor:"#1c94fe"} },
                            { text: 'Annuler', className:"alt-font", onClick: () => {setOpenAddModal(false)} },
                        ]}
                        onClose={() => {
                            setOpenAddModal(false)
                        }}
                        heading="Ajouter un nouveau registre"
                        components={{
                            Body: () => (
                                <div style={{padding:"2px 20px 20px 30px"}}>
                                    <div className="row mt-2">
                                        <div className="col-md-6 mt-1">
                                            <TextField
                                                label="Nom du registre"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                value={newReg_name}
                                                autoFocus={true}
                                                onChange={(e) => {setNewReg_name(e.target.value)}}
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
                            { text: 'Supprimer', onClick: () => {deleteRegistre(selectedRegId)}},
                            { text: 'Annuler', onClick: () => {
                                    setOpenDeleteModal(false)
                                }},
                        ]}
                        onClose={() => {
                            setOpenDeleteModal(false)
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
