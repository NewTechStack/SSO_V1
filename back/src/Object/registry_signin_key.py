import datetime
import json
import logging
import uuid
import hashlib
import re

try:
    from .registry import registry
    from .rethink import get_conn, r
except:
    pass
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registry_signin_key:
    def __init__(self, id = -1):
        self.id = str(id)
        self.last_check = None
        self.time_limit = {
            "up": 360000,
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
            "redirect": None,
            "registry": None,
            "auth": None,
            "date": None,
            "usrtoken": None,
	    "sub_payload": None,
            "asked": None
        }

    def create(self, registry, time, asked, redirect = None):
        if not isinstance(time, int) or time < self.time_limit['down'] or time > self.time_limit['up']:
            return [False, "Invalid time argument", 400]
        if not isinstance(registry, str):
	        return [False, "Invalid registry", 400]
        urlregex = re.compile(r"((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z]){2,6}([a-zA-Z0-9\.\&\/\?\:@\-_=#])*")
#         if redirect is not None and not urlregex.fullmatch(redirect):
#             return [False, "Invalid redirect url", 400]
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
        data["redirect"] = redirect
        data["registry"] = registry
        data["auth"] = auth_hash
        data["date"] = None
        data["usrtoken"] = None
        data["asked"] = asked
        self.red.insert([data]).run()
        return [True, {"key": key, "secret": secret, "auth": auth_hash}, None]

    def infos(self, key, auth):
        res = self.__key_exist(key, secret=None, auth=auth)
        if not res[0]:
            return res
        key_data = res[1]["key"]
        if len(key_data) > 1:
            return [False, "Internal error retry", 500]
        key_data = key_data[0]
        res = self.verify_time(key_data)
        if not res[0]:
            return res
        ret = key_data
        if 'registry' in key_data:
            ret['registry_id'] = str(key_data['registry'])
            ret['registry'] = registry(key_data['registry']).data()['name']['main']
        del ret["secret"]
        return [True, {"data": ret}, None]

    def signin(self, key, auth, usrtoken, sub_payload = None):
        res = self.__key_exist(key, auth=auth)
        if not res[0]:
            return [False, "Error invalid connection", 404]
        if len(res[1]) > 1:
            return [False, "Internal error retry", 500]
        ret = {
		"registry": res[1]["key"][0]["registry"],
                "redirect": res[1]["key"][0]["redirect"]
	}
        res = dict(self.red.filter(
            (r.row["key"] == key)
            &
            (r.row["auth"] == auth)
        ).update({"usrtoken": usrtoken, "sub_payload": sub_payload}).run())
        if res['replaced'] != 1:
            return [False, "Error", 500]
        return [True, ret, None]

    def wait_token(self, key, secret):
        query = res = self.red.filter(
            (r.row["key"] == key)
            &
            (r.row["secret"] == secret)
            &
            (r.row["usrtoken"] != None)
        )
        res = list(query.run())
        if len(res) != 0:
            res = res[0]
        else:
            for update in query.changes().run():
                res = update['new_val']
                break
        return [True, {"usrtoken": res['usrtoken'], "sub_payload": res["sub_payload"]}, None]

    def verify_time(self, key_data):
        now = datetime.datetime.utcnow()
        until = datetime.datetime.strptime(key_data["until"], '%Y-%m-%d %H:%M:%S.%f')
        if until < now:
            return [False, f"key expired", 401]
        return [True, {}, None]

    def __key_exist(self, key, secret = None, auth = None):
        ret =  [False, "Invalid combinaison", 401]
        if secret is None and auth is None:
            return [False, "Error", 500]
        if secret is not None:
            res = list(self.red.filter(
                (r.row["key"] == key)
                &
                (r.row["secret"] == secret)
            ).run())
            if len(res) == 0:
                return ret
        elif auth is not None:
            res = list(self.red.filter(
                (r.row["key"] == key)
                &
                (r.row["auth"] == auth)
            ).run())
            if len(res) == 0:
                return ret
        return [True, {"key": res}, None]

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
