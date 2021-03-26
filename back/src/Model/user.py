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

def user_get_key(cn, nextc):
    return cn.call_next(nextc, user().get_key())

def user_wait_token(cn, nextc):
    key = cn.rt["key"] if "key" in cn.rt else None
    err = check.contain(cn.pr, ["secret"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = user().wait_token(key, cn.pr["secret"])
    return cn.call_next(nextc, err)

def user_get_token(cn, nextc):
    id = None
    key = cn.rt["key"] if "key" in cn.rt else None
    asked = cn.pr["asked"] if cn.pr and "asked" in cn.pr and key is not None else []
    registeries = []
    if "id" in cn.get and cn.private["user"].has_role("creator")[0]:
        id = cn.get["id"]
    if "registeries" in cn.rt:
        registeries = cn.rt["registeries"].split(',')
    err = cn.private["user"].get_token(
            id=id,
            registeries=registeries,
            key=key,
            asked=asked
    )
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
    cn.private["user"] = user()
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
    cn.pr = check.setnoneopt(cn.pr, ["phone", "first_name", "last_name"])
    err = cn.private["user"].updetails(
        cn.pr["phone"],
        cn.pr["first_name"],
        cn.pr["last_name"]
    )
    return cn.call_next(nextc, err)

def user_role(cn, nextc):
    err = cn.private["user"].roles()
    return cn.call_next(nextc, err)

def user_disable(cn, nextc):
    err = cn.private["user"].delete()
    return cn.call_next(nextc, err)

def user_set_role(cn, nextc):
    err = cn.private["user"].has_role("creator")
    if not err[0]:
        err = cn.private["user"].has_role("admin")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = check.contain(cn.pr, ["role", "active"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = check.contain(cn.rt, ["id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = cn.private["user"].set_role(
        cn.rt["id"],
        cn.pr["role"],
        cn.pr["active"]
    )
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
