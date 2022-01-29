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
            "data": [],
            "date": {
                "start": None,
                "end": None
            },
            "details": {
                "ip": {
                    "address": None,
                    "location": None
                },
                "match": {
                    "browser": {
                        "familiy": None,
                        "version": None
                    },
                    "os": {
                        "familiy": None,
                        "version": None
                    },
                    "device": {
                        "familiy": None,
                        "brand": None,
                        "model": None
                    }
                }
            }
        }

    def details(self, user_agents, ip):
        details = self.model["details"];
        details['id']['address'] = str(ip)
        return details

    def validate(user_id, registry_id, data, user_agents = None, clic = False, exp = None):
        ret = self.model
        now = datetime.datetime.utcnow()
        if exp is not None and clic is False:
            exp = now + datetime.timedelta(months = 1)
        if user_agents is not None:
            ret['details'] = self.details(user_agents)

        ret['registry_id'] = registry_id
        ret['user_id'] = user_id
        ret['manual_validation'] = clic
        ret['data'] = data
        ret['date']['start'] = now
        ret['date']['end'] = exp
        """todo insert"""
        print(ret)
        return [True, {}, None]

    def need_validation(user_id, registry_id, data, user_agents = None, strict = False):
        now = datetime.datetime.utcnow()
        details = self.details(user_agents)
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
        self.validate(user_id, registry_id, data, user_agents, clic = False, exp)
        return [True, {"need_validation": False}, None]
