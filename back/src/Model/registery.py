from Controller.basic import check
from Object.registery import registery
from Object.user_registery import user_registery

def regi_create(cn, nextc):
    err = check.contain(cn.pr, ["name", "actions", "roles"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["reg"] = registery()
    err = cn.private["reg"].create(
        cn.pr["name"],
        cn.private["user"].id,
        cn.pr["actions"],
        cn.pr["roles"]
    )
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["reg_user"] = user_registery(
        cn.private["user"],
        cn.private["reg"]
    )
    err = cn.private["reg_user"].add_user(cn.private["user"].id, ["creator"], force=True)
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
    err = check.contain(cn.pr, ["open"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg"].set_open(cn.pr["open"])
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

def regi_check_key(cn, nextc):
    err = check.contain(cn.hd, ["apitoken"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["reg_user"].check_key(cn.hd["apitoken"])
    return cn.call_next(nextc, err)

def user_regi(cn, nextc):
    reg_id = cn.rt["registery"] if "registery" in cn.rt else -1
    cn.private["reg"] = registery(reg_id)
    cn.private["reg_user"] = user_registery(
        cn.private["user"],
        cn.private["reg"]
    )
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def registry_users(cn, nextc):
    reg_id = cn.rt["registery"] if "registery" in cn.rt else -1
    err = user_registery(None, None).all_user(reg_id)
    return cn.call_next(nextc, err)

def user_registries(cn, nextc):
    err = user_registery(None, None).all_from_user(cn.private["user"].id)
    return cn.call_next(nextc, err)

def user_regi_exist(cn, nextc):
    err = cn.private["reg_user"].exist(end=True)
    return cn.call_next(nextc, err)

def regi_can_delete(cn, nextc):
    err = cn.private["reg_user"].can("delete")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_edit(cn, nextc):
    err = cn.private["reg_user"].can("edit")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)

def regi_can_invite(cn, nextc):
    err = cn.private["reg_user"].can("invite")
    return cn.call_next(nextc, err)

def regi_can_use(cn, nextc):
    err = cn.private["reg_user"].can("use")
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

def regi_can_get_infos(cn, nextc):
    err = cn.private["reg_user"].can("get_infos")
    if err is True:
        err = [True, {}, None]
    else:
        err = [False, "Invalid rights", 403]
    return cn.call_next(nextc, err)
