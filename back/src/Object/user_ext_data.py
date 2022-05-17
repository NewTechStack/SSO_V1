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
        self.id = id if id is not None else user(email).id
        try:
            self.red = get_conn().db("auth").table('user_ext_data')
        except:
            self.red = None

    def input(self, data):
        data = {
            "usr_id": self.id,
            "registry": self.registry,
            "data": data,
            "date": str(datetime.datetime.utcnow())
        }
        self.red.insert([data]).run()
        return [True, {}, None]

    def get(self):
        ret = self.red.filter(r.row["usr_id"] == self.id)
        if self.registry is not None:
            ret = ret.filter(r.row["registry"] == self.registry)
        return [True, list(ret.run()), None]
