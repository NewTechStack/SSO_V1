from Controller.basic import check
from Object.registry import registry
from Object.user_registry import user_registry
from Object.registry_signin_key import registry_signin_key

def regi_create(cn, nextc):
    err = check.contain(cn.pr, ["name", "actions", "roles"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["reg"] = registry()
    err = cn.private["reg"].create(
        cn.pr["name"],
        cn.private["user"].id,
        cn.pr["actions"],
        cn.pr["roles"]
    )
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["reg_user"] = user_registry(
        cn.private["user"],
        cn.private["reg"]
    )
    err = cn.private["reg_user"].add_user(cn.private["user"].id, ["creator"], force=True)
    if err[0] is True:
        err = [True, {"registry_id": cn.private["reg"].id}, None]
    return cn.call_next(nextc, err)

def regi_invite(cn, nextc):
    err = check.contain(cn.pr, ["email"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["reg_user"] = user_registry(
        cn.private["user"],
        cn.private["reg"]
    )
    err = cn.private["reg_user"].add_user(None, roles = None, email = cn.pr["email"])
    if err[0] is True:
        err = [True, {"registry_id": cn.private["reg"].id}, None]
    return cn.call_next(nextc, err)

def regi_delete(cn, nextc):
    err = cn.private["reg"].delete()
    return cn.call_next(nextc, err)

def regi_infos(cn, nextc):
    err = cn.private["reg"].infos()
    return cn.call_next(nextc, err)

def regi_set_name(cn, nextc):
    err = check.contain(cn.pr, ["name"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].set_name(cn.pr["name"])
    return cn.call_next(nextc, err)

def regi_get_name(cn, nextc):
    err = cn.private["reg"].name()
    return cn.call_next(nextc, err)

def regi_set_open(cn, nextc):
    err = check.contain(cn.pr, ["open", "roles"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].set_open(cn.pr["open"], cn.pr["roles"])
    return cn.call_next(nextc, err)

def regi_add_role(cn, nextc):
    err = check.contain(cn.pr, ["roles"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].add_role(
        cn.pr["roles"],
    )
    return cn.call_next(nextc, err)

def regi_edit_role(cn, nextc):
    role = cn.rt["role"] if "role" in cn.rt else None
    err = check.contain(cn.pr, ["actions"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].edit_role(role, cn.pr["actions"])
    return cn.call_next(nextc, err)

def regi_delete_role(cn, nextc):
    role = cn.rt["role"] if "role" in cn.rt else None
    err = cn.private["reg"].delete_role(role)
    return cn.call_next(nextc, err)

def regi_role(cn, nextc):
    role = cn.rt["role"] if "role" in cn.rt else None
    err = cn.private["reg"].get_role(role)
    return cn.call_next(nextc, err)

def regi_roles(cn, nextc):
    err = cn.private["reg"].roles()
    return cn.call_next(nextc, err)

def regi_add_action(cn, nextc):
    err = check.contain(cn.pr, ["action"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].add_action(cn.pr["action"])
    return cn.call_next(nextc, err)

def regi_delete_action(cn, nextc):
    action = cn.rt["action"] if "action" in cn.rt else None
    err = cn.private["reg"].delete_action(action)
    return cn.call_next(nextc, err)

def regi_actions(cn, nextc):
    err = cn.private["reg"].actions()
    return cn.call_next(nextc, err)

def regi_add_key(cn, nextc):
    err = check.contain(cn.pr, ["name"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg_user"].add_key(cn.pr["name"])
    return cn.call_next(nextc, err)

def regi_delete_key(cn, nextc):
    key_id = cn.rt["key"] if "key" in cn.rt else None
    err = cn.private["reg_user"].delete_key(key_id)
    return cn.call_next(nextc, err)

def regi_keys(cn, nextc):
    err = cn.private["reg_user"].get_keys()
    return cn.call_next(nextc, err)

def regi_is_partener(cn, nextc):
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def regi_check_key(cn, nextc):
    """

    """
    err = check.contain(cn.pr, ["apitoken"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = user_registry(
	None,
	None
	).check_key(cn.pr["apitoken"], '*')
    if err[0]:
        cn.private["signin_reg"] = err[1]["registry"]
    return cn.call_next(nextc, err)

def regi_get_signin(cn, nextc):
    """
        Allow external plateform
        to get a single usage key

        POST /external/key
    """
    err = check.contain(cn.pr, ["valid_until", "apitoken", "asked"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    if not "signin_reg" in cn.private:
        err = [False, "Error", 500]
        return cn.toret.add_error(err[1], err[2])
    err = registry_signin_key().create(
            registry=cn.private["signin_reg"],
            time=cn.pr["valid_until"],
            asked=cn.pr["asked"]
        )
    return cn.call_next(nextc, err)

def regi_verify_signin(cn, nextc):
    """
        check user appartenance to every registry
        force subscribe him if it's isn't the case

        POST /intern/key/<>/signin
    """
    err = [True, None, None]
    if 'need_validation' in cn.private:
        if cn.private['need_validation'] != False:
            return cn.call_next(nextc, err)
    if 'registry' in cn.private:
        reg = cn.private['registry']
    elif 'signin_reg' in cn.private:
        reg = cn.private['signin_reg']
    else:
        return cn.toret.add_error("Internal Error", 500)
    cn.private["reg_user"] = user_registry(
        cn.private["user"],
        registry(id=reg)
    )
    exist = cn.private["reg_user"].exist(end=True, create=True)
    if exist[0] is False:
        err = [False, f"User is not part of registry: {reg}", 403]
    else:
        can_use = cn.private["reg_user"].can("get_infos")
        if can_use is False:
            err = [False, f"User is not allowed to use registry: {reg}", 403]
        else:
            cn.private['roles'] = cn.private["reg_user"].froles(active = True)[1]['roles']
    return cn.call_next(nextc, err)

def regi_end_signin(cn, nextc):
    """
    """
    if 'need_validation' in cn.private:
        if cn.private['need_validation'] != False:
            return regi_info_signin(cn, nextc)
    key = cn.rt["key"] if "key" in cn.rt else None
    if key is None:
        return cn.toret.add_error("Invalid key", 400)
    err = check.contain(cn.pr, ["auth"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    if not 'usrtoken' in cn.private:
       return cn.toret.add_error('Invalid signin', 403)
    registry_signin_key().signin(key, cn.pr["auth"], cn.private['usrtoken'])
    err = [True, {'registry': cn.private['registry']}, None]
    return cn.call_next(nextc, err)

def regi_info_signin(cn, nextc):
    """
    """
    key = cn.rt["key"] if "key" in cn.rt else None
    if key is None:
        return cn.toret.add_error("Invalid key", 400)
    err = check.contain(cn.pr, ["auth"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = registry_signin_key().infos(key, cn.pr["auth"])
    if err[0]:
        cn.private['registry'] = err[1]['data']['registry_id']
        cn.private['asked'] = err[1]['data']['asked']
    return cn.call_next(nextc, err)

def regi_wait_token(cn, nextc):
    key = cn.rt["key"] if "key" in cn.rt else None
    err = check.contain(cn.pr, ["secret"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = registry_signin_key().wait_token(key, cn.pr["secret"])
    return cn.call_next(nextc, err)

def user_regi(cn, nextc):
    reg_id = cn.rt["registry"] if "registry" in cn.rt else -1
    cn.private["reg"] = registry(reg_id)
    cn.private["reg_user"] = user_registry(
        cn.private["user"],
        cn.private["reg"]
    )
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def registry_users(cn, nextc):
    reg_id = cn.rt["registry"] if "registry" in cn.rt else -1
    err = user_registry(None, None).all_user(reg_id)
    return cn.call_next(nextc, err)

def user_registries(cn, nextc):
    user_id = cn.rt["user"] if "user" in cn.rt and cn.rt["user"] != 'registry' else cn.private["user"].id
    creator = cn.get["creator"] if "creator" in cn.get else True
    err = user_registry(None, None).all_from_user(user_id, creator)
    return cn.call_next(nextc, err)

def user_regi_role(cn, nextc):
    user_id = cn.rt["user"] if "user" in cn.rt else -1
    err = cn.private["reg_user"].get_role(user_id)
    return cn.call_next(nextc, err)

def user_regi_actions(cn, nextc):
    user_id = cn.rt["user"] if "user" in cn.rt else -1
    err = cn.private["reg_user"].actions(user_id)
    return cn.call_next(nextc, err)

def user_regi_change_role(cn, nextc):
    user_id = cn.rt["user"] if "user" in cn.rt else -1
    err = check.contain(cn.pr, ["roles"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg_user"].change_role(user_id, cn.pr["roles"])
    return cn.call_next(nextc, err)

def user_regi_exist(cn, nextc):
    err = cn.private["reg_user"].exist(end=True)
    return cn.call_next(nextc, err)

def regi_can_get_infos(cn, nextc):
    err = cn.private["reg_user"].can("get_infos")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_delete(cn, nextc):
    err = cn.private["reg_user"].can("delete")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_change_name(cn, nextc):
    err = cn.private["reg_user"].can("change_name")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_change_open(cn, nextc):
    err = cn.private["reg_user"].can("change_open")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_edit_role(cn, nextc):
    err = cn.private["reg_user"].can("edit_roles")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_edit_action(cn, nextc):
    err = cn.private["reg_user"].can("edit_actions")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_change_role(cn, nextc):
    err = cn.private["reg_user"].can("change_roles")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_invite(cn, nextc):
    err = cn.private["reg_user"].can("invite")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_use_api(cn, nextc):
    err = cn.private["reg_user"].can("use_api")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)
