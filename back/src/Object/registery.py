import datetime
import json
import logging
from .rethink import get_conn, r

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registery:
    def __init__(self, id = -1):
        self.id = str(id)
        self.last_check = None
        self.red = get_conn().db("auth").table('registery')
        self.d = None
        self.model = {
            "name": {
                "main": None,
                "creator": None,
                "last_update": None
            },
            "description": {
                "main": None,
                "last_update": None
            },
            "roles": {
                "builtin": {
                    "main": {
                        "creator": {
                            "actions": ["delete", "edit", "invite", "use", "get_infos"]
                        },
                        "admin": {
                            "actions": ["edit", "invite", "use", "get_infos"]
                        },
                        "user": {
                            "actions": ["use", "get_infos"]
                        },
                        "others": {
                            "actions": ["get_infos"]
                        }
                    },
                    "last_update": None
                },
                "custom": {
                    "main": {},
                    "last_update": None
                }
            },
            "actions": {
                "builtin": {
                    "main": ["delete", "edit", "invite", "use", "get_infos"],
                    "last_update": None
                },
                "custom": {
                    "main": [],
                    "last_update": None
                }
            },
            "open": {
                "main": False,
                "last_update": None
            },
            "last_update": None,
            "date": None
        }

    def data(self, update = False):
        if (self.d is None or update is True) and self.id != "-1":
            self.d = self.red.get(self.id).run()
            if self.d != None:
                self.d = dict(self.d)
        return self.d

    def name(self):
        return [True, {"name": self.data()["name"]}, None]

    def infos(self):
        d = self.data(True)
        if d is None:
            return [False, f"Registry {self.id} doesn't exist", 404]
        ret = {
        "name": d["name"],
        "description": d["description"],
        "open": d["open"],
        "last_update": d["last_update"],
        "date": d["date"]
        }
        return [True, ret, None]

    def create(self, name, creator, actions, roles, open = False):
        if not isinstance(name, str) or not isinstance(creator, str) or \
           not len(name) < 30:
            return [False, "Invalid name", 400]
        if self.__exist(name, creator):
            return [False, f"Registery {name} already exist", 401]
        if not isinstance(actions, list) and len(action) < 255:
            return [False, "Invalid action list", 400]
        if not all(isinstance(self.i, str) for self.i in actions):
            return [False, f"Invalid actions list: {self.i}", 400]
        if not all(len(self.i) < 30 for self.i in actions):
            return [False, f"Action too long: {self.i}", 400]
        if not isinstance(roles, dict) and len(dict) < 255:
            return [False, "Invalid role dict", 400]
        if not all(isinstance(roles[self.i], dict) for self.i in roles):
            return [False, f"Invalid role type {self.i}", 400]
        if not all(len(self.i) < 30 for self.i in roles):
            return [False, f"Role too long: {self.i}", 400]
        if not all("actions" in roles[self.i] for self.i in roles):
            return [False, f"No actions in role {self.i}", 400]
        if not all(len(roles[self.i].keys()) == 1 for self.i in roles):
            return [False, f"Invalid key in role {self.i}", 400]
        if not all(isinstance(roles[self.i]["actions"], list) for self.i in roles):
            return [False, f"Invalid roles action list {self.i}", 400]
        actions_builtin = self.model["actions"]["builtin"]["main"]
        if not all(self.i not in actions_builtin for self.i in actions):
            return [False, f"Custom action {self.i} is already a builtin action", 400]
        actions_custom = actions
        roles_builtin = [i for i in self.model["roles"]["builtin"]["main"]]
        if not all(self.i not in roles_builtin for self.i in roles):
            return [False, f"Custom role {self.i} is already a builtin role", 400]
        roles_custom = roles
        r = []
        [r.extend(i) for i in [roles[i]["actions"] for i in [i for i in roles_custom]]]
        if not all(isinstance(self.i, str) for self.i in r) or \
           not all(self.i in actions_builtin + actions_custom for self.i in r):
            return [False, f"Role's action are not valid : {self.i}"]
        date = str(datetime.datetime.utcnow())
        data = self.model
        data["actions"]["custom"]["main"] = actions_custom
        data["roles"]["custom"]["main"] = roles_custom
        data["date"] = date
        data["name"]["creator"] = creator
        data["name"]["main"] = name
        res = dict(self.red.insert([data]).run())
        self.id = res["generated_keys"][0]
        return [True, {"id": self.id}, None]

    def add_role(self, roles):
        res = self.red.get(self.id).run()
        if res is None:
            return [False, "Invalid registry_id", 404]
        date = str(datetime.datetime.utcnow())
        if not isinstance(roles, dict):
            return [False, "Invalid role", 400]
        if not all(isinstance(roles[self.i], dict) for self.i in roles):
            return [False, f"Invalid role: {self.i}", 400]
        if not all(len(self.i) < 30 for self.i in roles):
            return [False, f"Role too long: {self.i}", 400]
        if not all("actions" in roles[self.i] for self.i in roles):
            return [False, f"No actions in role {self.i}", 400]
        if not all(len(roles[self.i].keys()) == 1 for self.i in roles):
            return [False, f"Invalid key in role {self.i}", 400]
        if not all(isinstance(roles[self.i]["actions"], list) for self.i in roles):
            return [False, f"Invalid roles action list {self.i}", 400]
        actions_builtin = res["actions"]["builtin"]["main"]
        actions_custom = res["actions"]["custom"]["main"]
        roles_builtin = res["roles"]["builtin"]["main"].keys()
        roles_custom = res["roles"]["custom"]["main"].keys()
        r = []
        [r.extend(i) for i in [roles[i]["actions"] for i in [i for i in roles]]]
        if not all(isinstance(self.i, str) for self.i in r) or \
           not all(self.i in actions_builtin + actions_custom for self.i in r):
            return [False, f"Role's action are not valid : {self.i}"]
        if not all(self.i not in roles_custom for self.i in roles):
            return [False, f"Role {self.i} already exist"]
        if not all(self.i not in roles_builtin for self.i in roles):
            return [False, f"Role {self.i} is a builtin role"]
        roles = {
            **res["roles"]["custom"]["main"],
            **roles
        }
        self.red.get(self.id).update({
            "roles": {
                "custom": {
                    "main": roles,
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def edit_role(self, role, actions):
        if not isinstance(role, str):
            return [False, "Invalid role type", 400]
        if not isinstance(actions, list):
            return [False, "Invalid actions type", 400]
        if not all(isinstance(self.i, str) for self.i in actions):
            return [False, f"Invalid action {self.i}", 400]
        res = self.red.get(self.id).run()
        date = str(datetime.datetime.utcnow())
        roles_builtin = res["roles"]["builtin"]["main"]
        roles_custom = res["roles"]["custom"]["main"]
        all_actions = res["actions"]["builtin"]["main"] + res["actions"]["custom"]["main"]
        if role in roles_builtin:
            return [False, f"{role} is a builtin role", 401]
        if role not in roles_custom:
            return [False, f"{role} does not exist", 400]
        if not all(self.i in all_actions for self.i in actions):
            return [False, f"{self.i} does not exist", 400]
        roles_custom[roles]["actions"] = actions
        self.red.get(self.id).update({
            "roles": {
                "custom": {
                    "main": roles_customs,
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        return [True, {}, False]


    def delete_role(self, role):
        if not isinstance(role, str):
            return [False, f"Invalid role {role}", 400]
        res = self.red.get(self.id).run()
        date = str(datetime.datetime.utcnow())
        if role in res["roles"]["builtin"]["main"].keys():
            return [False, f"{role} is not a custom role", 400]
        if not role in res["roles"]["custom"]["main"].keys():
            return [False, f"{role} is not an existing role", 400]
        if self.__user_has_role(role):
            return [False, "Role is used by user(s)", 400]
        del res["roles"]["custom"]["main"][role]
        self.red.get(self.id).update({
            "roles": {
                "custom": {
                    "main": res["roles"]["custom"]["main"],
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def roles(self, details = False):
        res = self.red.get(self.id).run()
        roles_builtin = res["roles"]["builtin"]["main"]
        roles_custom = res["roles"]["custom"]["main"]
        if details is False:
            roles_builtin = list(roles_builtin.keys())
            roles_custom = list(roles_custom.keys())
        return [True, {"builtin": roles_builtin, "custom": roles_custom}, None]

    def actions(self):
        res = self.red.get(self.id).run()
        actions_builtin = res["actions"]["builtin"]["main"]
        actions_custom = res["actions"]["custom"]["main"]
        return [True, {"builtin": actions_builtin, "custom": actions_custom}, None]

    def add_action(self, action):
        if not isinstance(action, list) and not isinstance(action, str):
            return [False, "Invalid action type", 400]
        if isinstance(action, str):
            action = [action]
        if not all(isinstance(self.i, str) for self.i in action):
            return [False, f"Invalid action type {self.i}", 400]
        if not all(len(self.i) < 30 for self.i in action):
            return [False, f"Action too long: {self.i}", 400]
        res = self.red.get(self.id).run()
        date = str(datetime.datetime.utcnow())
        actions_builtin = res["actions"]["builtin"]["main"]
        actions_custom = res["actions"]["custom"]["main"]
        if not all(self.i not in actions_builtin for self.i in action):
            return [False, f"{self.i} is a builtin action", None]
        if not all(self.i not in actions_builtin for self.i in action):
            return [False, f"Action already exist: {self.i}", None]
        actions_custom.append(action)
        self.red.get(self.id).update({
            "actions": {
                "custom": {
                    "main": actions_custom,
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def delete_action(self, action):
        if not isinstance(action, list) and not isinstance(action, str):
            return [False, "Invalid action type", 400]
        if isinstance(action, str):
            action = [action]
        if not all(isinstance(self.i, str) for self.i in action):
            return [False, f"Invalid action type {self.i}", 400]
        if not all(len(self.i) < 30 for self.i in action):
            return [False, f"Action too long: {self.i}", 401]
        res = self.red.get(self.id).run()
        date = str(datetime.datetime.utcnow())
        actions_builtin = res["actions"]["builtin"]["main"]
        actions_custom = res["actions"]["custom"]["main"]
        if not all(self.i not in actions_builtin for self.i in action):
            return [False, f"{self.i} is a builtin action", 401]
        roles = {
            **res["roles"]["custom"]["main"],
            **res["roles"]["builtin"]["main"]
        }
        r = []
        [r.extend(i) for i in [roles[i]["actions"] for i in [i for i in roles]]]
        if not all(self.i not in r for self.i in action):
            return [False, f"Action '{self.i}' is used in a role", 401]
        [actions_custom.remove(i) for i in action]
        self.red.get(self.id).update({
            "actions": {
                "custom": {
                    "main": actions_custom,
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def delete(self):
        if self.id != -1:
            return [False, "Invalid registery", 401]
        if not dict(self.red.get(self.id).delete().run())["skipped"] == 0:
            return [False, "error", 500]
        return [True, {}, None]

    def set_name(self, name):
        if not isinstance(name, str):
            return [False, "Invalid name", 400]
        if self.__exist(name, creator):
            return [False, f"Registery {name} already exist"]
        date = str(datetime.datetime.utcnow())
        self.red.get(self.id).update({
            "name": {
                "main": name,
                "last_update": date
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def set_open(self, open = False):
        if not isinstance(open, bool):
            return [False, "Invalid param", 400]
        date = str(datetime.datetime.utcnow())
        self.red.get(self.id).update({
            "open": {
                "main": open,
                "last_update": date
            },
            "last_update": date
        }).run()
        return [True, {}, None]

    def __user_has_role(self, role):
        return False

    def __exist(self, name, creator):
        res = list(self.red.filter(
            (r.row["name"]["main"] == name)
            & (r.row["name"]["creator"] == creator)
        ).run())
        if len(res) > 0:
            return True
        return False


def test():
    logging.warning("-")
    logging.warning("Starting registery's test")
    r = registery()
    r.create("test", "user_id", ["test"], {"test": {"actions": []}, "adminn": {"actions": []}})
    r.add_role({"adminnn": {"actions": ["test"]}})
    r.delete_role("adminn")
    r.delete_action("test")
    r.roles(True)
    r.actions()
    r.delete()
    logging.warning("Ending registery's test")

try:
    test()
except:
    logging.error("Registery's test error")
