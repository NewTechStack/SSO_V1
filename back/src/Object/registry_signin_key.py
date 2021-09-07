import datetime
import json
import logging
import uuid
import hashlib
from tqdm import tqdm
try:
    from .rethink import get_conn, r
except:
    pass
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registry_signin_key:
    def __init__(self, id = -1):
        self.id = str(id)
        self.last_check = None
        self.time_limit = {
            "up": 180,
            "down": 10
        }
        try:
            self.red = get_conn().db("auth").table('registry_signin_key')
        except:
            self.red = None
        self.d = None
        self.model = {
            "key": None,
            "secret": None,
            "until": None,
            "registry_list": None,
            "date": None,
            "auth": None
        }

    def create(self, registry_list, time):
        if not isinstance(time, int) or time < 10 or time > 180:
            return [False, "Invalid time argument", 400]
        if not isinstance(registry_list, list) \
           and all(isinstance(self.i, str) for i in registry_list):
	        return [False, "Invalid registry list", 400]
        key = str(uuid.uuid4())
        secret = str(hash(uuid.uuid4()))
        while self.__key_exist(key, secret=secret)[0]:
            key = str(uuid.uuid4())
            secret = str(hash(uuid.uuid4()))
        data = self.model
        until = str(datetime.datetime.utcnow() + datetime.timedelta(seconds=time))
        data = self.model
        auth_hash = self.__salt(secret)
        data["key"] = key
        data["secret"] = secret
        data["until"] = until
        data["registry_list"] = registry_list
        data["auth"] = auth_hash
        data["date"] = None
        return [True, {"key": key, "secret": secret, "auth": auth_hash}, None]

    def infos(self, key, auth):
        res = self. __key_exist(self, key, auth=auth)
        if not res[0]:
            return res
        key_data = res[1]["key"]
        res = self.verify_time(key_data)
        if not res[0]:
            return res
        ret = key_data
        del ret["auth"]
        del ret["secret"]
        return [True, {"data": ret}, None]

    def get_wait(self, key, secret, auth):
        return [True, {}, None]

    def verify_time(self, key_data):
        now = datetime.datetime.utcnow()
        until = datetime.datetime.strptime(k["until"], '%Y-%m-%d %H:%M:%S.%f')
        if until < now:
            return [False, f"key expired", 401]
        return [True, {}, None]

    def __key_exist(self, key, secret = None, auth = None):
        ret =  [False, "Invalid combinaison", 401]
        if secret is not None:
            return ret
            #check if exist using filter key + secret
        elif auth is not None:
            pass
            #check if exist using filter key + auth
        ret = [True, None, None] # test only
        return ret

    def __salt(self, secret):
        salted = hashlib.sha512(
                    secret.encode('utf-8')
                 ).hexdigest()
        return salted


if __name__ == "__main__":
    r = registry_signin_key()
    res = r.create(
        registry_list = ["id_1", "id_2"],
        time=20,
    )
    print(res)
