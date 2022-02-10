import datetime
import json
import logging
import uuid
from user_agents import parse
from .rethink import get_conn, r
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

    def validate(self, user_id, registry_id, data, ip = '', user_agents = None, clic = False, exp = None):
        ret = self.model
        now = datetime.datetime.utcnow()
        """
        if clic by user exp in 4 weeks
        else but already clicked by the past and exp in les than 7 days exp in 7 days
        """
        if clic is True:
            exp = now + datetime.timedelta(weeks = 4)
        else:
            if exp is not None and now > exp - datetime.timedelta(days = 7):
                exp = now + datetime.timedelta(days = 7)
            else:
                return [False, "Internal error", 500]
        if user_agents is not None:
            ret['details'] = self.__details(user_agents, ip)
        ret['registry_id'] = registry_id
        ret['user_id'] = user_id
        ret['manual_validation'] = clic
        ret['data'] = data
        ret['date']['start'] = str(now)
        ret['date']['end'] = str(exp)
        res = dict(self.red.insert([ret]).run())
        return [True, {}, None]

    def need_validation(self, user_id, registry_id, data, ip = '', user_agents = None, strict = False):
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
            &
            (
                strict == False
                |
                (
                    r.row['details']['device']['hash'] == details['device']['hash']
                    &
                    r.row['details']['browser']['hash'] == details['browser']['hash']
                )
            )
        ).run())
        if len(res) == 0:
            return [True, {"need_validation": True}, None]
        return [True, res, None]
        exp = '' """todo retrieve"""
        self.validate(user_id, registry_id, data, user_agents, clic = False, exp=exp)
        return [True, {"need_validation": False}, None]
