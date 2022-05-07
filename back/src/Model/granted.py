from Controller.basic import check
from Object.registry_granted import registry_granted
import json

def registry_granted_click(cn, nextc):
    user_agents = None
    client_ip = cn.req.environ.get('HTTP_X_FORWARDED_FOR') or cn.req.environ.get('REMOTE_ADDR')
    if 'user-agent' in cn.hd:
        user_agents = cn.hd['user-agent']
    user_id = cn.private['user'].id
    registry_id = cn.private['registry']
    data = cn.private['asked']
    err = registry_granted().validate(
        user_id = user_id,
        registry_id = registry_id,
        data = data,
        ip = client_ip,
        user_agents = user_agents,
        clic = True,
        exp = None)
    return cn.call_next(nextc, err)

def registry_need_validation(cn, nextc):
    user_agents = None
    client_ip = cn.req.environ.get('HTTP_X_FORWARDED_FOR') or cn.req.environ.get('REMOTE_ADDR')
    if 'user-agent' in cn.hd:
        user_agents = cn.hd['user-agent']
    user_id = cn.private['user'].id
    registry_id = cn.private['registry']
    data = cn.private['asked']
    err = registry_granted().need_validation(user_id, registry_id, data, ip = client_ip, user_agents = user_agents, strict = False)
    if err[0]:
        cn.private['need_validation'] = err[1]['need_validation']
    return cn.call_next(nextc, err)

def registry_granted_logs(cn, nextc):
    user_id = cn.private['user'].id
    err = registry_granted().logs(user_id)
    return cn.call_next(nextc, err)

def registry_granted_history(cn, nextc):
    err = check.contain(cn.pr, ["user_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    err = registry_granted().history(cn.private["reg"].id, cn.pr['user_id'])
    return cn.call_next(nextc, err)
