import datetime
from .rethink import red, r

red = red.db("auth").table('user_registery')

class user_registery:
    def __init__(self, registery):
        self.reg_id = registery.id
        self.usr_id = user.id
        self.roles = registery.roles

    def add_user(self, id_user, roles, by):
        if self.exist():
            return [False, "User already in registery", 401]
        date = str(datetime.datetime.now())
        res = dict(red.insert([{
            "id_registery": self.id,
            "id_user": id_user,
            "date": date,
            "last_update": None,
            "roles": {},
            "by": by
        }]))
        if isinstance(roles, list):
            for i in roles:
                self.__status(id_user, i)
        else:
            self.__status(roles, i)
        id = res["generated_keys"][0]
        return id

    def user(user_id):
        res = list(red.filter(r.row["id_user"] == id_user and "id_registery" == self.reg_id).run())[0]
        return res

    def exist(self, id_user):
        res = list(red.filter(r.row["id_user"] == id_user and "id_registery" == self.reg_id).run())
        if len(res) > 0:
            return True
        return False

    def __status(self, id_user, role, from, active = True):
        if self.roles is None:
            return None
        role = str(role)
        if role not in self.roles:
            return False
        date = str(datetime.datetime.now())
        roles = list(red.filter(
            r.row["id_user"] == id_user and "id_registery" == self.id
        ).run())[0]["roles"]
        if role not in roles:
            red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": from,
                    }
                },
                "last_update": date
            }).run()
            ret = True
        else:
            ret = dict(red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": from
                    }
                },
                "last_update": date
            }).run())["skipped"] == 0
        return ret
