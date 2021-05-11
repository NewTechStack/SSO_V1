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
import AtlButton from '@atlaskit/button';
import {Edit,Trash} from '../../components/icons';
import Modal, {ModalTransition} from "@atlaskit/modal-dialog";
import TextField from "@material-ui/core/TextField";



const data = [
    {
        id:"82a3f9f0-f2bb-4d96-ba6d-a0e1b2dd1696",
        date:moment().format("DD-MM-YYYY"),
        name:'Test01',
        statut:"privé"
    },
    {
        id:"d1518e63-bc8c-4bcf-968a-bed966645ca2",
        date:moment().format("DD-MM-YYYY"),
        name:'Test02',
        statut:"ouvert"
    }
]

export default function Pro(props){

    const columns = [
        {
            name: 'Action',
            cell: row => <div>
                {/*<IconButton>
                    <Edit />
                </IconButton>*/}
                <IconButton onClick={() => {
                    setSelectedRegId(row.id)
                    setOpenDeleteModal(true)
                }}>
                    <Trash/>
                </IconButton>
            </div>,
            grow:0.5
        },
        {
            name: 'Date de création',
            selector: 'date',
            cell: row => moment(row.date).format("DD-MM-YYYY HH:mm"),
            sortable: true,
        },
        {
            name: 'Nom',
            selector: 'name',
            sortable: true,
        }
    ];

    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = React.useState(false);
    const [loadingBtnAdd, setLoadingBtnAdd] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState("registries");
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [openAddModal, setOpenAddModal] = React.useState(false);
    const [newReg_name, setNewReg_name] = React.useState("");
    const [registres, setRegistres] = React.useState();
    const [selectedRegId, setSelectedRegId] = React.useState("");


    useEffect(() => {
        setTimeout(() => {
            if(verifSession() === true){
                getRegistres()
            }else{
                enqueueSnackbar('Session expirée', { variant:"warning" })
                enqueueSnackbar('Reconnexion en cours...', { variant:"info" })
                setTimeout(() => {
                    props.history.push("/sso/login")
                },2000)
            }
        },2000)

    }, []);

    const verifSession = () => {
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }

    const getRegistres = () => {
        setLoading(true)
        SSO_service.get_registres(localStorage.getItem("usrtoken")).then(res => {
            console.log(res)
            if(res.status === 200 && res.succes === true){
                setLoading(false)
                setRegistres(res.data.registries || [])
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
            if(addRes.status === 200 && addRes.succes === true){
                setLoadingBtnAdd(false)
                setOpenAddModal(false)
                enqueueSnackbar("L'ajout du nouveau registre est effectué avec succès", { variant:"success" })

            }else{
                enqueueSnackbar(addRes.error, { variant:"error" })
            }
        }).catch(err => {
            console.log(err)
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

    const getTabContent = () => {

        if (selectedTab === 'registries') {
            return (
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
                            props.history.push("/main/pro/registre/" + row.id_registery )
                        }}
                    />

                </div>
            )
        }
    }

    const handleChangedTab = (event, selected) => {
        setSelectedTab(selected)
    }

    return(

        <div>
            <MuiBackdrop open={loading}/>
            <div className="container container-lg" style={{marginTop:50}}>
                <div className="info_form">
                    <div>
                        <div className="main_padding-form">

                            <h5 style={{fontSize:"1.25rem"}}>Espace Pro</h5>
                            <label style={{color:"#5f6368",fontSize:12}}>Votre interface Pro pour gérer vos services</label>

                            <div className="rainbow-flex rainbow-flex_column rainbow_vertical-stretch mt-5">
                                <Tabset
                                    fullWidth
                                    id="tabset-1"
                                    onSelect={handleChangedTab}
                                    activeTabName={selectedTab}
                                    className="rainbow-p-horizontal_x-large"
                                >
                                    <Tab
                                        label="Mes registres"
                                        name="registries"
                                        id="registries"
                                        ariaControls="primaryTab"
                                    />

                                    <Tab
                                        label="Mes services"
                                        name="recents"
                                        id="recents"
                                        ariaControls="recentsTab"
                                    />

                                    <Tab label="Mes abonnements" name="shared" id="shared" ariaControls="sharedTab" />

                                    <Tab label="" name="locked" id="locked" ariaControls="lockedTab" />

                                </Tabset>
                                <Divider style={{marginTop:20,marginBottom:20}}/>
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
                            { text: 'Ajouter', className:"alt-font", onClick: () => {addNewRegistre()}, isLoading:loadingBtnAdd },
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