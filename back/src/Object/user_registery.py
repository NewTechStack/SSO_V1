import datetime
from .rethink import get_conn, r

class user_registery:
    def __init__(self, user, registery):
        self.user = user
        self.reg = registery
        self.user.data(True)
        self.usr_id = user.id
        self.reg_id = registery.id
        self.roles = registery.roles
        self.invite = False
        self.d = None
        self.red = get_conn().db("auth").table('user_registery')

    def data(self, id_user = None,update = False):
        id_user = id_user if id_user is not None else self.usr_id
        if id_user is None and self.invite is True:
            return {
                "id_registery": self.id,
                "id_user": -1,
                "date": 0,
                "last_update": None,
                "roles": {
                    "others": {
                        "active": True,
                        "last_update": 0,
                        "by": None,
                    }
                },
                "by": self.usr_id
            }
        if ((self.d is None or update is True) and self.usr_id != "-1") or \
            id_user is None:
            d = self.red.filter(
                r.row["id_user"] == id_user
                & r.row["id_registery"] == self.reg_id
            ).run()
            d = list(d)
            if id_user is not None:
                if len(d) == 1:
                    return dict(d[0])
                else:
                    return None
            if len(d) == 1:
                self.d = dict(d[0])
            else:
                self.d = None
        return self.d

    def add_user(self, id_user, roles, email = None, force = False):
        if not (isinstance(roles, list) and all(isinstance(i, str) for i in roles)) and not isinstance(roles, str):
            return [False, "Invalid roles format", 400]
        if not isinstance(roles, list):
            roles = [roles]
        if str(self.usr_id) == str("-1"):
            return [False, "Invalid user", 401]
        if str(self.reg_id) == str("-1"):
            return [False, "Invalid registery", 401]
        roles = self.reg.roles()[1]
        roles = roles["builtin"] + roles["custom"]
        if not all(self.i in roles for self.i in roles):
            return [False, f"Invalid role: {self.i}", 400]
        if not force and not self.can("invite"):
            return [False, "User cannot invite other users", 401]
        if email is not None:
            u = user(-1, email)
            if u.id == "-1":
                u.invite(email)
                u = user(-1, email)
            id_user = u.id
        if id_user == "-1":
            return [False, "Invalid user", 401]
        if self.exist(id_user):
            return [False, "User already in registery", 401]
        date = str(datetime.datetime.now())
        res = dict(self.red.insert([{
            "id_registery": self.id,
            "id_user": id_user,
            "date": date,
            "last_update": None,
            "roles": {},
            "by": self.usr_id
        }]))
        for i in roles:
            self.__status(id_user, i)
        id = res["generated_keys"][0]
        return [True, {"id": id}, None]

    def froles(self, id_user = None, active = None):
        id_user = id_user if id_user is not None else self.usr_id
        d = self.data(id_user)
        if d is None:
            return [False, "Invalid user", 400]
        roles = list(d["roles"].keys())
        if active != None:
            to_del = []
            for i in roles:
                if d["roles"][i]["active"] != active:
                    to_del.append(i)
            for i in to_del:
                roles = list(filter((i).__ne__, roles))
        return [True, {"roles": roles}, None]

    def has_role(self, role, id_user = None, active = True):
        id_user = id_user if id_user is not None else self.usr_id
        r = self.froles(id_user, active)
        return role in r[1]["roles"] if r[0] else False

    def actions(self, id_user = None):
        id_user = id_user if id_user is not None else self.usr_id
        r = self.froles(id_user, True)
        if not r[0]:
            return r
        d = self.reg.data()
        ret = []
        for i in r[1]["roles"]:
            if i in d["actions"]["builtin"]["main"]:
                ret.extend(d["actions"]["builtin"]["main"][i])
            elif i in d["actions"]["custom"]["main"]:
                ret.extend(d["actions"]["custom"]["main"][i])
        return [True, {"actions": list(set(ret))}, None]

    def can(self, action, id_user = None):
        id_user = id_user if id_user is not None else self.usr_id
        a = self.actions(id_user)
        return action in a[1]["actions"] if a[0] else False

    def exist(self, id_user = None, end = False):
        if id_user is None:
            if self.d != None:
                return True
            res = list(self.red.filter(r.row["id_user"] == self.usr_id & r.row["id_registery"] == self.reg_id).run())
            if len(res) == 1:
                self.d = res[0]
            if len(res) > 0:
                if end is True:
                    return [True, self.d, None]
                return True
            if end is True:
                self.invite = True
                return [True, {}, None]
        else:
            res = list(self.red.filter(r.row["id_user"] == id_user & r.row["id_registery"] == self.reg_id).run())
            if len(res) > 0:
                if end is True:
                    return [True, res[0], None]
                return True
            if end is True:
                return [False, "Invalid user for this registery", 404]
        return False

    def __status(self, id_user, role, active = True):
        if self.roles is None:
            return None
        role = str(role)
        if role not in self.roles:
            return False
        date = str(datetime.datetime.now())
        roles = list(self.red.filter(
            r.row["id_user"] == id_user and r.row["id_registery"] == self.id
        ).run())[0]["roles"]
        if role not in roles:
            self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": self.usr_id,
                    }
                },
                "last_update": date
            }).run()
            ret = True
        else:
            ret = dict(self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": self.usr_id
                    }
                },
                "last_update": date
            }).run())["skipped"] == 0
        return ret
