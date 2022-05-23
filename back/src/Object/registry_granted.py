import datetime
import json
import logging
import uuid
from user_agents import parse
from .rethink import get_conn, r
from .users import user
import hashlib

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registry_granted:
    def __init__(self, id = -1):
        self.id = str(id)
        self.last_check = None
        self.red = get_conn().db("auth").table('registry_granted')
        self.d = None
        self.model = {
            "registry_id": None,
            "user_id": None,
            "user_id_hashed": None,
            "manual_validation": False,
            "data": {},
            "date": {
                "start": None,
                "end": None
            },
            "details": {
                "ip": {
                    "address": None,
                },
                "browser": {
                    "family": None,
                    "version": None,
                    "hash": None
                },
                "device": {
                    "family": None,
                    "brand": None,
                    "model": None,
                    "os": {
                        "family": None,
                        "version": None
                    },
                    "type": {
                        "mobile": None,
                        "tablet": None,
                        "pc": None,
                        "bot": None
                    },
                    "hash": None
                }
            }
        }

    def __details(self, user_agents, ip):
        details = self.model["details"]
        user_agent = parse(user_agents)
        details['ip']['address'] = str(ip)
        details['browser']['family'] = user_agent.browser.family
        details['browser']['version'] = user_agent.browser.version_string
        details['device']['family'] = user_agent.device.family
        details['device']['brand'] = user_agent.device.brand
        details['device']['model'] = user_agent.device.model
        details['device']['os']['family'] = user_agent.os.family
        details['device']['os']['version'] = user_agent.os.version_string
        details['device']['type']['mobile'] = user_agent.is_mobile
        details['device']['type']['tablet'] = user_agent.is_tablet
        details['device']['type']['pc'] = user_agent.is_pc
        details['device']['type']['bot'] = user_agent.is_bot
        details['device']['hash'] = hashlib.md5(str(details['device']).encode()).hexdigest()
        details['browser']['hash'] = hashlib.md5(str(details['browser']).encode()).hexdigest()
        return details

    def history(self, registry_id, user_id, email = None):
        if email is None and user_id is None:
            return [False, "invalid arguments", 400]
        if user_id is None:
            user_id = user(email=email).id
        if user_id == "-1":
            return [False, "invalid user", 404]
        user_id_hashed = user.encoded_id(id=user_id, registry_id=registry_id, raw = True)
        res = list(self.red.filter(
            (r.row["user_id_hashed"] == user_id_hashed)
            &
            (r.row["registry_id"] == registry_id)
            ).order_by(r.desc(r.row['date']['end'])).limit(1).run())
        if len(res) == 0:
            return [False, "User never connected to this registry can't read information", 403]
        res = res[0]
        askable = user(res['user_id']).askable
        ret = {
                'registry_id': res['registry_id'],
                'user_id': user_id_hashed,
                'data_shared': {
                    asked:askable[asked]['data']() for asked in res['data']
                }
            }
        return [True, ret, None]

    def validate(self, user_id, registry_id, data, ip = '', user_agents = None, clic = False, exp = None):
        """
        if clic by user exp in 4 weeks
        else but already clicked by the past and exp in les than 7 days exp in 7 days
        """
        ret = self.model
        now = datetime.datetime.utcnow()
        if user_id == "-1":
            return [False, "Invalid user", 404]
        if clic is True:
            exp = now + datetime.timedelta(weeks = 4)
        else:
            if exp is not None:
                exp = datetime.datetime.strptime(exp, '%Y-%m-%d %H:%M:%S.%f')
                if now > exp - datetime.timedelta(days = 7):
                    exp = now + datetime.timedelta(days = 7)
            else:
                return [False, "Internal error", 500]
        if user_agents is not None:
            ret['details'] = self.__details(user_agents, ip)
        ret['registry_id'] = registry_id
        ret['user_id'] = user_id
        ret['user_id'] = user_id
        ret['manual_validation'] = clic
        ret['data'] = data
        ret['date']['start'] = str(now)
        ret['date']['end'] = str(exp)
        res = dict(self.red.insert([ret]).run())
        return [True, {}, None]

    def need_validation(self, user_id, registry_id, data, ip = '', user_agents = None, strict = False):
        if user_id == "-1":
            return [False, "Invalid user", 404]
        now = str(datetime.datetime.utcnow())
        details = self.__details(user_agents, ip)
        if user_agents is None:
            return [True, {"need_validation": True}, None]
        res = list(self.red.filter(
            (r.row["user_id"] == user_id)
            &
            (r.row["registry_id"] == registry_id)
            &
            (r.row['date']['start'] <= now & r.row['date']['end'] >= now)
            # &
            # (
            #     strict == False
            #     |
            #     (
            #         r.row['details']['device']['hash'] == details['device']['hash']
            #         &
            #         r.row['details']['browser']['hash'] == details['browser']['hash']
            #     )
            # )
        ).order_by(r.desc(r.row['date']['end'])).run())
        if len(res) == 0:
            return [True, {"need_validation": True}, None]
        askable = user(user_id).askable
        for potential in res:
            in_data = {i : False for i in data}
            for d in data:
                if d in potential['data']:
                    asked = askable[d]['data']()
                    in_data[d] = asked is not None and asked is not False
            print(in_data)
            if all(i for i in in_data.values()):
                self.validate(user_id, registry_id, data, user_agents, clic = False, exp=potential['date']['end'])
                return [True, {"need_validation": False}, None]
        return [True, {"need_validation": True}, None]

    def logs(self, user_id):
        if user_id == "-1":
            return [False, "Invalid user", 404]
        now = str(datetime.datetime.utcnow())
        ret = {'devices': {}}
        logs = list(self.red.filter(
            (r.row["user_id"] == user_id)
            &
            (r.row['date']['start'] <= now & r.row['date']['end'] >= now)
        ).order_by(r.desc(r.row['date']['start'])).group(
            r.row['details']['device']['hash'],
            r.row['details']['browser']['hash'],
            r.row['details']['ip']['address'],
            r.row['registry_id']
        ).ungroup().run())
        for log in logs:
            if log['group'][0] not in ret['devices']:
                ret['devices'][log['group'][0]] = {}
            if log['group'][1] not in ret['devices'][log['group'][0]]:
                ret['devices'][log['group'][0]][log['group'][1]] = {}
            if log['group'][2] not in ret['devices'][log['group'][0]][log['group'][1]]:
                ret['devices'][log['group'][0]][log['group'][1]][log['group'][2]] = {}
            ret['devices'][log['group'][0]][log['group'][1]][log['group'][2]][log['group'][3]] = log['reduction']
        res = []
        for device in ret['devices']:
            dev = list(ret['devices'][device].values())
            res2 = []
            for browser in dev:
                bro = list(browser.values())
                res3 = []
                for ip in bro:
                    res4 = list(ip.values())
                    res3.append({"registry": res4})
                res2.append({"ip": res3})
            res.append({"browser": res2})
        ret = {'devices': res}
        return [True,  ret, None]
