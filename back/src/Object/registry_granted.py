import datetime
import json
import logging
import uuid
from user_agents import parse
from .rethink import get_conn, r

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
                "match": {
                    "browser": {
                        "family": None,
                        "version": None
                    },
                    "os": {
                        "family": None,
                        "version": None
                    },
                    "device": {
                        "family": None,
                        "brand": None,
                        "model": None,
                        "type": {
                            "mobile": None,
                            "tablet": None,
                            "pc": None,
                            "bot": None
                        }
                    },
                }
            }
        }

    def __details(self, user_agents, ip):
        details = self.model["details"]
        user_agent = parse(user_agents)
        details['ip']['address'] = str(ip)
        details['match']['browser']['family'] = user_agent.browser.family
        details['match']['browser']['version'] = user_agent.browser.version_string
        details['match']['os']['family'] = user_agent.os.family
        details['match']['os']['version'] = user_agent.os.version_string
        details['match']['device']['family'] = user_agent.device.family
        details['match']['device']['brand'] = user_agent.device.brand
        details['match']['device']['model'] = user_agent.device.model
        details['match']['device']['type']['mobile'] = user_agent.is_mobile
        details['match']['device']['type']['tablet'] = user_agent.is_tablet
        details['match']['device']['type']['pc'] = user_agent.is_pc
        details['match']['device']['type']['bot'] = user_agent.is_bot
        return details

    def validate(self, user_id, registry_id, data, ip = '', user_agents = None, clic = False, exp = None):
        ret = self.model
        now = datetime.datetime.utcnow()
        """
        if clic by user exp in 1month
        else but already clicked by the past and exp in les than 7 days exp in 7 days
        """
        if clic is True:
            exp = now + datetime.timedelta(months = 12)
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
        """todo insert"""
        return [True, {}, None]

    def need_validation(self, user_id, registry_id, data, ip = '', user_agents = None, strict = False):
        now = datetime.datetime.utcnow()
        details = self.__details(user_agents, ip)
        if user_agents is None:
            return [True, {"need_validation": True}, None]
        res = list(self.red.filter(
            (r.row["user_id"] == user_id)
            &
            (r.row["registry_id"] == registry_id)
            &
            ("""date""")
            &
            (strict == False | r.row['details']['match'] == details['match'])
        ).run())
        """need check data + date"""
        if len(res) == 0:
            return [True, {"need_validation": True}, None]
        exp = '' """todo retrieve"""
        self.validate(user_id, registry_id, data, user_agents, clic = False, exp=exp)
        return [True, {"need_validation": False}, None]
