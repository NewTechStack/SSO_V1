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
import AccordionDetails from "@material-ui/core/AccordionDetails";
import PhoneInput from "react-phone-input-2";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {countryList} from "../../../constants/defaultValues";





class accept_service extends Component {

    kyc_passport={}

    state = {
        first_loading:true,
        loading:false,
        key:this.props.match.params.key,
        auth:this.props.match.params.auth,
        error:false,
        asked:[],
        registry_name:[],
        approuved:false,
        show:"first",
        toAsk:[],
        confirmed:{},
        redirect:""


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
                if(res.status === 200 && res.succes === true){
                    console.log(res)
                    if(!res.data.data && res.data.redirect && res.data.registry){
                        window.location.replace(res.data.redirect)
                    }else{
                        SSO_service.getRegistryAskable(localStorage.getItem("usrtoken"),res.data.data.registry_id).then( regaskData => {
                            console.log(regaskData)
                            if(regaskData.status === 200 && regaskData.succes === true){

                                let asked = regaskData.data.main || []
                                let toAsk = []
                                if(asked.findIndex(x => x === "first_name") > -1 && (!user_data.first_name || (user_data.first_name && user_data.first_name.main === null))) toAsk.push("first_name")
                                if(asked.findIndex(x => x === "last_name") > -1 &&(!user_data.last_name || (user_data.last_name && user_data.last_name.main === null))) toAsk.push("last_name")
                                if(asked.findIndex(x => x === "phone") > -1 && (!user_data.phone || (user_data.phone && user_data.phone.main === null))) toAsk.push("phone")
                                if(asked.findIndex(x => x === "address_city") > -1 && (!user_data.location || (user_data.location && (user_data.location.main === null || user_data.location.main.city === null) ))) toAsk.push("address_city")
                                if(asked.findIndex(x => x === "address_details") > -1 && (!user_data.location || (user_data.location && (user_data.location.main === null || user_data.location.main.details === null) ))) toAsk.push("address_details")
                                if(asked.findIndex(x => x === "is_first_name_verified") > -1  || asked.findIndex(x => x === "is_last_name_verified") > -1  ||
                                    asked.findIndex(x => x === "is_age_verified") > -1  ||  asked.findIndex(x => x === "is_nationality_verified") > -1  ||
                                    asked.findIndex(x => x === "is_address_city_verified") > -1  ||  asked.findIndex(x => x === "is_address_details_verified") > -1){
                                    if(user_data.verified && user_data.verified.identity && user_data.verified.identity.score === 3){
                                        console.log("PASSEPORT VERIFIED")
                                    }else{
                                        toAsk.push("passport")
                                    }

                                }


                                console.log(asked)
                                console.log(toAsk)
                                this.setState({
                                    loading:false,first_loading:false,
                                    asked:asked,toAsk:toAsk,
                                    redirect:res.data.data.redirect,
                                    registry_name:res.data.data.registry
                                })

                            }else{
                                this.setState({error:true,loading:false,first_loading:false})
                                this.props.enqueueSnackbar("Vous n'êtes pas autorisé à utiliser ce service", { variant:"error",autoHideDuration:5000 })
                            }
                        }).catch( err => {
                            console.log(err)
                            this.setState({error:true,loading:false,first_loading:false})
                            this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré !', { variant:"error",autoHideDuration:5000  })
                        })

                    }


                }else{
                    this.setState({error:true,loading:false,first_loading:false})
                    this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré !', { variant:"error",autoHideDuration:5000 })
                }
            }).catch( err => {
                console.log(err)
                this.setState({error:true,loading:false,first_loading:false})
                this.props.enqueueSnackbar('Une erreur est survenue, url invalide ou expiré !', { variant:"error",autoHideDuration:5000  })
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

    extern_signin(redirect_url){
        this.setState({loading:true})

        SSO_service.extern_signin(localStorage.getItem("usrtoken"),this.state.key,{auth:this.state.auth}).then( res => {
            console.log(res)
            if(res.status === 200 && res.succes === true){
                this.setState({approuved:true})
                this.props.enqueueSnackbar('Connexion approuvée avec succès !', { variant:"success",autoHideDuration:10000 })
                if(this.state.redirect !== ""){
                    setTimeout(() => {
                        this.setState({loading:false})
                        window.location.replace(redirect_url)
                    },2500)

                }
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
        return new Promise(resolve => {

            SSO_service.updateUser(data,localStorage.getItem("usrtoken")).then( updateRes => {
                if (updateRes.status === 200 && updateRes.succes === true) {
                    resolve("true")
                } else {
                    resolve("false")
                }
                console.log(updateRes)
            }).catch(err => {
                console.log(err)
                resolve("false")
            })

        })

    }

    getAsyncUserInfo = () => {

        return new Promise( resolve => {

            SSO_service.getUser(localStorage.getItem("usrtoken")).then(infoRes => {
                if(infoRes.status === 200 && infoRes.succes === true){
                    resolve(infoRes.data)
                }else{
                    resolve(false)
                }
            }).catch(err => {
                console.log(err)
            })

        })

    }

    renderAskedForm = (ask) => {
        if(ask === "first_name"){
            return (
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez indiquer votre Nom </h4>
                    <h5 style={{marginTop:15}}>Ces informations sont nécessaires pour continuer</h5>
                    <div className="row mt-4">
                        <div className="col-md-12 mt-1">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Nom"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.first_name || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.first_name = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                                <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                        disabled={!this.state.confirmed.first_name || this.state.confirmed.first_name.trim() === ""}
                                        onClick={async () => {
                                            this.setState({loading:true})
                                            let update_user = await this.updateUser({details:{first_name:{first_name:this.state.confirmed.first_name}}})
                                            if(update_user && update_user === "true"){
                                                let toAsk = this.state.toAsk
                                                toAsk.splice(toAsk.findIndex(x => x === "first_name"),1)
                                                this.setState({toAsk: toAsk,loading:false})
                                            }else{
                                                this.props.enqueueSnackbar('Une erreur est survenue', { variant:"error",autoHideDuration:5000  })
                                                this.setState({loading:false})
                                            }
                                        }}
                                >
                                    Continuer
                                </Button>

                        </div>
                    </div>
                </div>
            )
        }else if(ask === "last_name"){
            return (
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez indiquer votre Prénom </h4>
                    <h5 style={{marginTop:15}}>Ces informations sont nécessaires pour continuer</h5>
                    <div className="row mt-4">
                        <div className="col-md-12 mt-1">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Prénom"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.last_name || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.last_name = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                    disabled={!this.state.confirmed.last_name || this.state.confirmed.last_name.trim() === ""}
                                    onClick={async () => {
                                        this.setState({loading:true})
                                        let update_user = await this.updateUser({details:{last_name:{last_name:this.state.confirmed.last_name}}})
                                        if(update_user && update_user === "true"){
                                            let toAsk = this.state.toAsk
                                            toAsk.splice(toAsk.findIndex(x => x === "last_name"),1)
                                            this.setState({toAsk: toAsk,loading:false})
                                        }else{
                                            this.props.enqueueSnackbar('Une erreur est survenue', { variant:"error",autoHideDuration:5000  })
                                            this.setState({loading:false})
                                        }
                                    }}
                            >
                                Continuer
                            </Button>

                        </div>
                    </div>
                </div>
            )
        }else if(ask === "phone"){
            return (
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez indiquer votre numéro de téléphone </h4>
                    <h5 style={{marginTop:15}}>Ces informations sont nécessaires pour continuer</h5>
                    <div className="row mt-4">
                        <div className="col-md-12 mt-1">
                            <PhoneInput
                                country={'fr'}
                                value={this.state.confirmed.phone || ""}
                                onChange={ phone => {
                                    let confirmed = this.state.confirmed
                                    confirmed.phone = phone
                                    this.setState({confirmed:confirmed})
                                }}
                                masks={{fr: '... ... ...',tn:'.. ... ...'}}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                    disabled={!this.state.confirmed.phone || this.state.confirmed.phone.trim() === ""}
                                    onClick={async () => {
                                        this.setState({loading:true})
                                        let update_user = await this.updateUser({details:{phone:{number:this.state.confirmed.phone,lang: "FR",}}})
                                        if(update_user && update_user === "true"){
                                            let toAsk = this.state.toAsk
                                            toAsk.splice(toAsk.findIndex(x => x === "phone"),1)
                                            this.setState({toAsk: toAsk,loading:false})
                                        }else{
                                            this.props.enqueueSnackbar('Une erreur est survenue', { variant:"error",autoHideDuration:5000  })
                                            this.setState({loading:false})
                                        }
                                    }}
                            >
                                Continuer
                            </Button>

                        </div>
                    </div>
                </div>
            )

        }else if(ask === "nationality"){
            return (
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez indiquer votre nationalité </h4>
                    <h5 style={{marginTop:15}}>Ces informations sont nécessaires pour continuer</h5>
                    <div className="row mt-4">
                        <div className="col-md-12 mt-1">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Nationalité"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.nationality || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.nationality = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                    disabled={!this.state.confirmed.nationality || this.state.confirmed.nationality.trim() === ""}
                                    onClick={async () => {
                                        this.setState({loading:true})
                                        let update_user = await this.updateUser({details:{nationality:{nationality:this.state.confirmed.nationality}}})
                                        if(update_user && update_user === "true"){
                                            let toAsk = this.state.toAsk
                                            toAsk.splice(toAsk.findIndex(x => x === "nationality"),1)
                                            this.setState({toAsk: toAsk,loading:false})
                                        }else{
                                            this.props.enqueueSnackbar('Une erreur est survenue', { variant:"error",autoHideDuration:5000  })
                                            this.setState({loading:false})
                                        }
                                    }}
                            >
                                Continuer
                            </Button>

                        </div>
                    </div>
                </div>
            )
        }else if(ask === "address_city" || ask === "address_details"){
            return(
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez indiquer votre adresse </h4>
                    <h5 style={{marginTop:15}}>Ces informations sont nécessaires pour continuer</h5>
                    <div className="row mt-4">
                        <div className="col-lg-12 mt-1">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Rue"
                                placeholder="Exp: 10 rue de liberté"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.street || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.street = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                                InputLabelProps={{shrink:true}}
                            />
                        </div>
                        <div className="col-lg-12 mt-3">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Code postal"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.pc || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.pc = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                                InputLabelProps={{shrink:true}}
                            />
                        </div>
                        <div className="col-lg-12 mt-3">
                            <TextField
                                //inputRef={f_username_ref}
                                label="Ville"
                                variant="outlined"
                                size="small"
                                style={{width:"100%"}}
                                value={this.state.confirmed.city || ""}
                                onChange={(e) => {
                                    let confirmed = this.state.confirmed
                                    confirmed.city = e.target.value
                                    this.setState({confirmed:confirmed})
                                }}
                                InputLabelProps={{shrink:true}}
                            />
                        </div>
                        <div className="col-lg-12 mt-3">
                            <Autocomplete
                                autoComplete={"off"}
                                autoHighlight={false}
                                size="small"
                                options={countryList}
                                /*classes={{
                                    option: classes.option,
                                }}*/
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
                                    let confirmed = this.state.confirmed
                                    confirmed.pays = value.label
                                    this.setState({confirmed:confirmed})
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        value={countryList.findIndex(x => x.label === this.state.confirmed.pays || "") > -1 ? this.state.confirmed.pays : "" }
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
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                    disabled={!this.state.confirmed.street || this.state.confirmed.street.trim() === "" || !this.state.confirmed.city || this.state.confirmed.city.trim() === "" ||
                                    !this.state.confirmed.pc || this.state.confirmed.pc.trim() === "" || !this.state.confirmed.pays || this.state.confirmed.pays.trim() === ""
                                    }
                                    onClick={async () => {
                                        this.setState({loading:true})
                                        let update_user = await this.updateUser({details:{location:{location:{country:this.state.confirmed.pays,city:this.state.confirmed.city,details:{street:this.state.confirmed.street,postal_code:this.state.confirmed.pc}},public:false }}})

                                        if(update_user && update_user === "true"){
                                            let toAsk = this.state.toAsk
                                            let fin_ask_city_index = toAsk.findIndex(x => x === "address_city")
                                            if(fin_ask_city_index > -1) toAsk.splice(fin_ask_city_index,1)

                                            let fin_ask_details_index = toAsk.findIndex(x => x === "address_details")
                                            if(fin_ask_details_index > -1) toAsk.splice(fin_ask_details_index,1)

                                            if(toAsk.length === 0){
                                                this.extern_signin(this.state.redirect)
                                            }else{
                                                this.setState({toAsk: toAsk,loading:false})
                                            }

                                        }else{
                                            this.props.enqueueSnackbar('Une erreur est survenue', { variant:"error",autoHideDuration:5000  })
                                            this.setState({loading:false})
                                        }
                                    }}
                            >
                                Continuer
                            </Button>

                        </div>
                    </div>
                </div>
            )

        }else if(ask === "passport"){
            return (
                <div>
                    <h4 style={{fontSize:"1.4rem",marginBottom:5}}>Veuillez télécharger votre passeport </h4>
                    <h5 style={{marginTop:15}}>C'est juste une étape de vérification de vos informations saisies</h5>
                    <div className="row mt-4">
                        <div className="col-lg-12 mb-3 mt-3" align="center">
                            <div className="kyc-file-upload" style={{textAlign:"center",cursor:"pointer",maxWidth:400}}
                                 onClick={() => {
                                     this.kyc_passport.click()
                                 }}
                            >
                                {
                                    !this.state.passport_image ? "Télécharger une copie de votre passeport" :
                                        <img alt="" src={this.state.passport_image} style={{width:200,height:130}}/>
                                }
                            </div>
                            <h6>
                                {this.state.passport_file ? this.state.passport_file.name : "" }
                            </h6>
                            <input accept={["image/png", "image/jpeg", "image/jpg"]}
                                   style={{
                                       display: 'false',
                                       width: 0,
                                       height: 0
                                   }}
                                   ref={(ref) => (this.kyc_passport = ref)}
                                   onChange={(e) => {
                                       this.upload_kyc_passport(e)
                                   }}
                                   type={"file"}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div align="right" className="col-lg-12">

                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary"
                                    disabled={!this.state.passport_file}
                                    onClick={() => {
                                        this.verif_kyc_passport()
                                    }}
                            >
                                Envoyer
                            </Button>

                        </div>
                    </div>
                </div>
            )
        }
    }

    upload_kyc_passport = (e) => {
        //this.setState({loading:true})
        let file = e.target.files[0]

        if( file && file.size > 10000000){
            alert("La taille maximale autorisée est de 10 Mo")
        }else if(file && (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg")){
            alert("Format non autorisé")
        }
        else{
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend =  (e) => {
                let result = reader.result
                this.setState({passport_file: file,passport_image:result})
            }
            /*const data = new FormData();
            data.append("file", file);
            SSO_service.kyc_upload_passport(localStorage.getItem("usrtoken"),localStorage.getItem("id"),data).then( async res => {
                console.log(res)
                if(res.status === 200 && res.succes === true){
                    this.setState({loading:false})
                    this.props.enqueueSnackbar("La vérification de votre passeport est bien effectué avec succès !", { variant:"success",autoHideDuration:5000  })
                }else{
                    this.setState({loading:false})
                    this.props.enqueueSnackbar(res.error, { variant:"error",autoHideDuration:5000  })
                }
            }).catch( err => {
                console.log(err)
                this.setState({loading:false})
                this.props.enqueueSnackbar("Une erreur est survenue lors de la vérification de votre passeport", { variant:"error",autoHideDuration:5000  })
            })*/
        }

    }


    verif_kyc_passport(){

        let file =this.state.passport_file
        const data = new FormData();
        data.append("passport",file,file.name)
        this.setState({loading:true})
        SSO_service.kyc_upload_passport(localStorage.getItem("usrtoken"),localStorage.getItem("id"),data).then( async res => {
            console.log(res)
            if(res.status === 200 && res.succes === true){
                this.setState({loading:false})
                this.props.enqueueSnackbar("La vérification de votre passeport est bien effectué avec succès !", { variant:"success",autoHideDuration:5000  })
                setTimeout(() => {
                    this.extern_signin(this.state.redirect)
                },2000)
                /*let toAsk = this.state.toAsk
                toAsk.splice(toAsk.findIndex(x => x === "passport"),1)
                this.setState({toAsk: toAsk})*/
            }else{
                this.setState({loading:false})
                this.props.enqueueSnackbar(res.error, { variant:"error",autoHideDuration:5000  })
            }
        }).catch( err => {
            console.log(err)
            this.setState({loading:false})
            this.props.enqueueSnackbar("Une erreur est survenue lors de la vérification de votre passeport", { variant:"error",autoHideDuration:5000  })
        })
    }


    render() {
        console.log(this.state.toAsk)
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
                                    {
                                        this.state.show === "first" &&
                                        <div>
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
                                                      //this.extern_signin()
                                                      if(this.state.toAsk.length > 0){
                                                          this.setState({
                                                              show:this.state.toAsk
                                                          })
                                                      }else{
                                                          this.extern_signin(this.state.redirect)
                                                      }
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
                                    }
                                    {
                                        this.state.show !== "first" &&
                                        this.renderAskedForm(this.state.toAsk[0])
                                    }



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
