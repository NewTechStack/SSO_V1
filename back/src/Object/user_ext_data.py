import datetime
from .users import user
try:
    from .rethink import get_conn, r
except:
    pass


class User_ext_data():
    """docstring for ."""

    def __init__(self, id = None, email = None, registry = None):
        self.registry = registry
        self.id = id if id is not None else user(email=email).id
        self.user_id_hashed = None
        if registry is not None:
            self.user_id_hashed = user.encoded_id(id=id, raw=True, registry_id=registry)
        try:
            self.red = get_conn().db("auth").table('user_ext_data')
        except:
            self.red = None

    def input(self, data):
        if self.id == "-1":
            return [False, "Invalid user", 404]
        data = {
            "usr_id": self.id,
            "user_id_hashed": self.user_id_hashed,
            "registry": self.registry,
            "data": data,
            "date": str(datetime.datetime.utcnow())
        }
        self.red.insert([data]).run()
        return [True, {}, None]

    def get(self):
        if self.id == "-1":
            return [False, "Invalid user", 404]
        ret = self.red
        if self.user_id_hashed is None:
            ret = ret.filter(r.row["usr_id"] == self.id)
        else:
            ret = ret.filter(r.row["user_id_hashed"] == self.user_id_hashed)
        if self.registry is not None:
            ret = ret.filter(r.row["registry"] == self.registry)
        return [True, list(ret.run()), None]
