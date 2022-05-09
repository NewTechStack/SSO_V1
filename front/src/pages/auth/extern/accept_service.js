import React, {Component} from "react";
import MuiBackdrop from "../../../components/Loading/MuiBackdrop";
import { Progress } from 'semantic-ui-react'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import '../login_signup.css'
import { withSnackbar } from 'notistack';
import SSO_service from "../../../provider/SSO_service";
import moment from "moment";
import jwt_decode from "jwt-decode";
import utilFunctions from "../../../tools/functions";





class accept_service extends Component {



    state = {
        first_loading:true,
        loading:false,
        key:this.props.match.params.key,
        auth:this.props.match.params.auth,
        error:false,
        asked:[],
        registry_name:[],
        approuved:false
    };


    async componentDidMount() {


        if(utilFunctions.verif_session() === false){
            this.props.history.push("/sso/extern/"+this.props.match.params.key+ "/" + this.props.match.params.auth)
        }else{

            //console.log(localStorage.getItem("usrtoken"))

            this.setState({loading:true})

            let user_data = await this.getAsyncUserInfo()
            console.log(user_data)

            SSO_service.get_extern_info_key(localStorage.getItem("usrtoken"),this.state.key,{auth:this.state.auth}).then( res => {
                console.log(res)
                if(res.status === 200 && res.succes === true){
                    let registries_list = res.data.data.registry_list || [];
                    let registry = registries_list[0]

                    this.setState({
                        loading:false,first_loading:false,
                        asked:res.data.data.asked || [],
                        registry_name:res.data.data.registry
                    })
                }else{
                    this.setState({error:true,loading:false,first_loading:false})
                    this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré !', { variant:"error",autoHideDuration:20000 })
                }
            }).catch( err => {
                console.log(err)
                this.setState({error:true,loading:false,first_loading:false})
                this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré !', { variant:"error",autoHideDuration:20000  })
            })
        }
    }

    translate_asked = (item) => {
        return item === "phone" ? "Votre numéro de téléphone" :
            item === "first_name" ? "Votre nom" :
                item === "last_name" ? "Votre prénom" :
                    item === "age" ? "Votre âge" :
                        item === "is_over_12" ? "Si votre âge est supérieur à 12 ans" :
                            item === "is_over_16" ? "Si votre âge est supérieur à 16 ans" :
                                item === "is_over_18" ? "Si votre âge est supérieur à 18 ans" :
                                    item === "is_over_21" ? "Si votre âge est supérieur à 21 ans" :
                                        item === "is_phone_verified" ? "Si votre numéro de téléphone est verifié" :
                                            item === "is_email_verified" ? "Si votre adresse mail est verifié" :
                                                item === "is_age_verified" ? "Si votre âge est verifié" :
                                                    item === "is_first_name_verified" ? "Si votre nom est verifié" :
                                                        item === "nationality" ? "Votre nationalité" :
                                                        item === "is_nationality_verified" ? "Si votre nationalité est verifié" :
                                                        item === "address_city" ? "Votre ville d'adresse" :
                                                        item === "is_address_city_verified" ? "Si votre ville d'adresse est verifié" :
                                                        item === "address_details" ? "Votre adresse" :
                                                        item === "is_address_details_verified" ? "Si votre adresse est verifié" :
                                                        item === "is_last_name_verified" ? "Si votre prénom est verifié" : item

    }

    extern_signin(){
        this.setState({loading:true})
        SSO_service.extern_signin(localStorage.getItem("usrtoken"),this.state.key,{auth:this.state.auth}).then( res => {
            console.log(res);
            if(res.status === 200 && res.succes === true){

                this.setState({loading:false,approuved:true})
                this.props.enqueueSnackbar('Connexion approuvée avec succès !', { variant:"success",autoHideDuration:10000 })
            }else{
                this.setState({loading:false})
                this.props.enqueueSnackbar(res.error, { variant:"error",autoHideDuration:5000  })
            }
        }).catch( err => {
            console.log(err)
            this.setState({loading:false})
            this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré', { variant:"error",autoHideDuration:5000  })

        })
    }

    updateUser = (data) => {
        this.setState({loading:true})
        SSO_service.updateUser(data,localStorage.getItem("usrtoken")).then( updateRes => {
            if (updateRes.status === 200 && updateRes.succes === true) {

            } else {
                this.setState({loading:false})
            }
            console.log(updateRes)
        }).catch(err => {
            console.log(err)
            this.setState({loading:false})
        })
    }

    getAsyncUserInfo = () => {

        return new Promise( resolve => {

            SSO_service.getUser(localStorage.getItem("usrtoken")).then(infoRes => {
                console.log(infoRes)
                if(infoRes.status === 200 && infoRes.succes === true){
                    resolve(true)
                }else{
                    resolve(false)
                }
            }).catch(err => {
                console.log(err)
            })

        })

    }


    render() {

        return (
            <>
                <MuiBackdrop open={this.state.loading}  />
                <div className="container container-lg" style={{marginTop:120}}>

                    {
                        this.state.error === false && this.state.first_loading === false && this.state.approuved === false &&
                        <div className="login_form">
                            {
                                this.state.loading === true ?
                                    <LinearProgress /> :
                                    <Progress active={false} percent={100} size="medium" className="custom-progress-height" color='blue' />
                            }

                            <div>
                                <div className="padding-form">

                                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Demande de connexion</h4>
                                    <h5 style={{marginTop:15}}>Pour continuer, le service <b>{this.state.registry_name}</b> devrait avoir accès à ces informations:</h5>
                                    <ul style={{listStyle:"disc",marginLeft:30,marginTop:15}}>
                                        {
                                            this.state.asked.map( (item,key) => (
                                                <li key={key}>{this.translate_asked(item)}</li>
                                            ))
                                        }
                                    </ul>

                                    <form id="login-form" style={{maxWidth:500,alignSelf:"center"}}
                                          onSubmit={(e) => {
                                              e.preventDefault(); e.stopPropagation();
                                              this.extern_signin()
                                          }}
                                    >

                                        <div className="row mt-4">
                                            <div className="col-md-12" align="center">
                                                <div style={{display:"flex",justifyContent:"center"}}>
                                                    <Button color="primary" style={{textTransform:"none"}}
                                                            onClick={() => {}}>Annuler</Button>
                                                    <Button type="submit" variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary">Continuer</Button>
                                                </div>
                                            </div>
                                        </div>

                                    </form>
                                </div>
                            </div>

                        </div>
                    }


                </div>
            </>
        )

    }

}


export default withSnackbar(accept_service)
