const endpoint = process.env.REACT_APP_ENDPOINT
const user_id = process.env.REACT_USER_ID



let SSO_service = {

    loadHeadersWithoutToken() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append("Accept", 'application/json');
        return headers;
    },

    loadHeaders(usrtoken) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append("Accept", 'application/json');
        headers.append("usrtoken",usrtoken);
        return headers;
    },

    getToken(){
        return fetch(endpoint + '/token', {
            method: 'GET',
            headers:this.loadHeadersWithoutToken()
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    register(data){
        return fetch(endpoint + '/signup', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    login(data){
        return fetch(endpoint + '/signin', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getUser(usrtoken){
        return fetch(endpoint + '/user?extended=true', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getAccountInfo(usrtoken){
        return fetch(endpoint + '/user/'+ user_id +'?extended=true', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    updateUser(data,usrtoken){
        return fetch(endpoint + '/user', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    deleteAccount(usrtoken){
        return fetch(endpoint + '/user', {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken),
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getKeyForChangePwd(usrtoken){
        return fetch(endpoint + '/user/password/change', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    changePassword(data,usrtoken){
        return fetch(endpoint + '/user/password/change', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    registry_signin(registries,key,data,usrtoken){
        return fetch(endpoint + '/registeries/' + registries + '/key/' + key + '/signin', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    resetRequest(data){
        return fetch(endpoint + '/user/password/reset', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registres(usrtoken){
        return fetch(endpoint + '/user/registery', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre(data,usrtoken){
        return fetch(endpoint + '/registery', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_info_registre(id,usrtoken){
        return fetch(endpoint + '/registery/' + id, {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre(id,usrtoken){
        return fetch(endpoint + '/registery/' + id, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken),
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_name(id,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/name', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_roles(id,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/roles', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre_role(id,data,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/role', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_role(id,id_role,data,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/role/' + id_role, {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre_role(id,id_role,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/role/' + id_role, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_actions(id,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/actions', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre_action(id,data,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/action', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre_action(id,id_action,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/role/' + id_action, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_name(id,data,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/name', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_state(id,data,usrtoken){
        return fetch(endpoint + '/registery/' + id + '/open', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    }






};

export default SSO_service;