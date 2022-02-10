from Controller.basic import check
from Object.registry_granted import registry_granted
import json

def registry_granted_click(cn, nextc):
    user_agents = None
    client_ip = cn.req.environ.get('HTTP_X_FORWARDED_FOR') or cn.req.environ.get('REMOTE_ADDR')
    if 'user-agent' in cn.hd:
        user_agents = cn.hd['user-agent']
    usr_id = cn.private['user'].id
    registry_id = cn.private['registry']
    data = cn.private['asked']
    err = registry_granted().validate(usr_id, registry_id, data, ip = client_ip, user_agents = user_agents, clic = True, exp = None)
    return cn.call_next(nextc, err)