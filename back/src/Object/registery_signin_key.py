import datetime
import json
import logging
import uuid
from .rethink import get_conn, r

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registery_signin_key:
    def __init__(self, id = -1):
        self.id = str(id)
        self.last_check = None
        self.red = get_conn().db("auth").table('registery_signin_key')
        self.d = None
        self.model = {
            "key": None,
            "secret": None,
            "until": None,
            "registery_list": None,
            "date": None
        }

    def create(self, registry_list, time):
        key = str(uuid.uuid4())
        secret = str(hash(uuid.uuid4()))
        while self.__key_exist(key, secret):
            key = str(uuid.uuid4())
            secret = str(hash(uuid.uuid4()))
        data = self.model
        until = str(datetime.datetime.utcnow() + datetime.timedelta(hours=24))
        return [True, {"key": key, "secret": secret}, None]

    def verify(self):
        now = datetime.datetime.utcnow()
        until = datetime.datetime.strptime(k["until"], '%Y-%m-%d %H:%M:%S.%f')
        if until < now:
            return [False, f"key expired", 401]
        return [True, {}, None]

    def __key_exist(self, key, secret):
        return False
