import datetime
import json
import logging
import uuid
from .rethink import get_conn, r

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registery_key:
    def __init__(self, id = -1):
        self.id = str(id) #registrery id
        self.last_check = None
        self.red = get_conn().db("auth").table('registery_key')
        self.d = None
        self.model = {
            "registry_id": None,
            "user_id": None,
            "name": None,
            "key": None,
            "active": None,
            "date": None,
            "authorized_ip": None
        }

    def add(self, name, user_id, registry_id):
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        if not isinstance(str, name):
            return [False, "Invalid type for name", 400]
        if not len(name) < 30:
            return [False, "Name should be less than 30 char", 400]
        key = str(uuid.uuid4()).replace('-', '')
        while self.__exist(key):
            key = str(uuid.uuid4()).replace('-', '')
        date = str(datetime.datetime.utcnow())
        data = self.model
        data["registry_id"] = registry_id
        data["user_id"] = user_id
        data["name"] = name
        data["key"] = key
        data["date"] = date
        data["active"] = True
        data["authorized_ip"] = []
        res = dict(self.red.insert([data]).run())
        id = res["generated_keys"][0]
        return [True, {"id": id}, None]

    def delete(self, id, shared, user_id):
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        key = self.red.get(id).run()
        if  key is None:
            return [False, "Invalid key id", 404]
        if shared is False and user_id != key["user_id"]:
            return [False, "Not the owner of the key", 403]
        self.red.get(id).delete().run()
        return [True, {}, None]

    def get(self, shared, user_id, registry_id):
        """
            Allow users to retrieve register's keys
            if `!shared` only get the keys belonging to the current user

            GET /registery/<>/keys
        """
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        if shared is False:
            ret = list(self.red.filter(
                (r.row["user_id"] == user_id)
                &
                (r.row["register_id"] == self.id)
            ).run())
        else:
            try:
                ret = list(self.red.filter(
                    (r.row["register_id"] == self.id)
                ).run())
            except:
                return [False, "error", 500]
        return [True, {"keys": ret}, None]

    def check(self, key, ip):
        if not isinstance(key, list) or not isinstance(key, str):
            return [False, "Invalid key format", 400]
        if isinstance(key, str):
            key = [key]
        if not all(isinstance(self.i, str) for self.i in key):
            return [False, f"Invalid key in keys list: {self.i}", 400]
        if not isinstance(ip, str):
            return [False, "Internal forward error", 500]
        ret = []
        list_key = key
        res = list(self.red.filter(
                lambda key:
                    (len(key["authorized_ip"]) == 0 or ip in key["authorized_ip"])
                    and
                    key["active"] is True
                    and
                    key["key"] in list_key
                ).run())
        for i in res:
            ret.append(i["registry_id"])
            list_key.remove(i["key"])
        if len(list_key) > 0:
            return [False, f"Invalid key(s): '{list_key}'", 404]
        return [True, {'registry': ret}, None]
