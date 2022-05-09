from Controller.basic import check
from Object.users import user
import json

def origin_check(cn, nextc):
    err = [True, {}, None]
    # err = check.contain(cn.pr, [])
    # err = check.contain(cn.hd, ["token"], "HEAD")
    # ged_id = cn.rt["ged"] if "ged" in cn.rt else None
    # err = check.contain(cn.get, ["search"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    return cn.call_next(nextc, err)

def user_publickey(cn, nextc):
    err = user.public_key()
    return cn.call_next(nextc, err)

def user_get_token(cn, nextc):
    id = None
    reg = ""
    asked = []
    roles = []
    err = [True, None, None]
    if 'need_validation' in cn.private:
        if cn.private['need_validation'] != False:
            return cn.call_next(nextc, err)
    if "id" in cn.get and cn.private["user"].has_role("creator")[0]:
        id = cn.get["id"]
    if 'registry' in cn.private and 'asked' in cn.private and 'roles' in cn.private:
        reg = cn.private['registry']
        asked = cn.private['asked']
        roles = cn.private['roles']
    elif 'signin_reg' in cn.private:
        reg = cn.private['signin_reg']
        asked = ['username', 'email']
        roles = cn.private['roles']
    err = cn.private["user"].get_token(
            id=id,
            registry=reg,
            asked=asked,
            roles=roles
    )
    if err[0]:
        cn.private['usrtoken']=err[1]['usrtoken']
    return cn.call_next(nextc, err)

def user_get_askable(cn, nextc):
    err = user().get_askable()
    return cn.call_next(nextc, err)

def user_check_asked(cn, nextc):
    err = check.contain(cn.pr, ["asked"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = user().check_asked(cn.pr['asked'])
    return cn.call_next(nextc, err)

def admin_user_search(cn, nextc):
    query = cn.get["q"] if "q" in cn.get else ""
    page = cn.get["page"] if "page" in cn.get else 0
    bypage = cn.get["bypage"] if "bypage" in cn.get else 1000
    invite = True if "invite" in cn.get else False
    expand = True if "expand" in cn.get else False
    err = user().search_user(query, page, bypage, admin=True, invite=invite, expand=expand)
    return cn.call_next(nextc, err)

def user_search(cn, nextc):
    query = cn.get["query"] if "query" in cn.get else None
    page = cn.get["page"] if "page" in cn.get else 0
    bypage = cn.get["bypage"] if "bypage" in cn.get else 10
    err = user().search_user(query, page, bypage)
    return cn.call_next(nextc, err)

def user_verify_token(cn, nextc):
    reenable = True if "reenable" in cn.get else False
    err = check.contain(cn.hd, ["usrtoken"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"] = user()
    err = cn.private["user"].verify(cn.hd["usrtoken"], reenable)
    return cn.call_next(nextc, err)


def user_tmp_spoof(cn, nextc):
    err = check.contain(cn.pr, ["email"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"] = user(email=cn.pr["email"])
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def user_register(cn, nextc):
    err = check.contain(cn.pr, ["email", "pass1", "pass2"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"] = user()
    err = cn.private["user"].register(
        cn.pr["email"],
        cn.pr["pass1"],
        cn.pr["pass2"]
    )
    return cn.call_next(nextc, err)

def user_kyc(cn, nextc):
    err = cn.private["user"].KYC('')
    return cn.call_next(nextc, err)

def user_login(cn, nextc):
    err = check.contain(cn.pr, ["login", "password"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"] = user()
    err = cn.private["user"].login(
        cn.pr["login"],
        cn.pr["password"]
    )
    return cn.call_next(nextc, err)

def user_update(cn, nextc):
    cn.pr = check.setnoneopt(cn.pr, ['username', 'email', 'details'])
    err = cn.private["user"].updetails(cn.pr['username'], cn.pr['email'], cn.pr['details'])
    return cn.call_next(nextc, err)

def user_preferences(cn, nextc):
    err = check.contain(cn.pr, ["store_user_agent", "store_ip", "dark_mode"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["user"].update_preferences(
        store_user_agent = cn.pr['store_user_agent'],
        store_ip = cn.pr['store_ip'],
        dark_mode = cn.pr['dark_mode']
    )
    return cn.call_next(nextc, err)

def user_role(cn, nextc):
    err = cn.private["user"].roles()
    return cn.call_next(nextc, err)

def user_disable(cn, nextc):
    err = cn.private["user"].delete()
    return cn.call_next(nextc, err)

def user_set_role(cn, nextc):
    # err = cn.private["user"].has_role("creator")
    # if not err[0]:
    #     err = cn.private["user"].has_role("admin")
    # if not err[0]:
    #     return cn.toret.add_error(err[1], err[2])
    err = check.contain(cn.pr, ["role", "active"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = check.contain(cn.rt, ["user"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["user"].set_role(
        cn.rt["user"],
        cn.pr["role"],
        cn.pr["active"]
    )
    if err is not True:
        err = [False, "Invalid role", 404]
    else:
        err = [True, {}, None]
    return cn.call_next(nextc, err)

def admin_user_infos(cn, nextc):
    id = cn.rt["user"] if "user" in cn.rt else None
    extended = cn.get["extended"] if "extended" in cn.get else False
    err = user(id).get_infos(extended)
    return cn.call_next(nextc, err)

def user_infos(cn, nextc):
    id = cn.rt["user"] if "user" in cn.rt else None
    extended = cn.get["extended"] if "extended" in cn.get else False
    err = cn.private["user"].get_infos(extended, id)
    return cn.call_next(nextc, err)

def user_password_reset(cn, nextc):
    err = cn.private["user"].reset_key()
    return cn.call_next(nextc, err)

def user_password_change(cn, nextc):
    err = check.contain(cn.pr, ["key", "password"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["user"].verify_reset_key(cn.pr["key"], cn.pr["password"])
    return cn.call_next(nextc, err)

def user_invite(cn, nextc):
    err = check.contain(cn.pr, ["email"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"].invite(cn.pr["email"])
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def user_invite_ext(cn, nextc):
    err = check.contain(cn.pr, ["email"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = user().invite(cn.pr["email"], hash = True)
    return cn.call_next(nextc, err)

def user_is_admin(cn, nextc):
    err = cn.private["user"].has_role("creator")
    if not err[0]:
        err = cn.private["user"].has_role("admin")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    return cn.call_next(nextc, err)

def user_is_creator(cn, nextc):
    err = cn.private["user"].has_role("creator")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    return cn.call_next(nextc, err)
