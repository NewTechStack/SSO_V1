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
            "data": [],
            "date": {
                "start": None,
                "end": None
            },
            "details": {
                "ip": {
                    "adress": None,
                    "location": None
                },
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
