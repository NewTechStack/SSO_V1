from Model.auth import *
from Model.user import *
from Model.registery import *

def setuproute(app, call):
    @app.route('/',                             ['OPTIONS', 'GET'],         lambda x = None: call([origin_check])) #done

    @app.route('/signup',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_register, user_get_token])) #done
    @app.route('/signin',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_login, user_get_token])) #done
    @app.route('/token',                        ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_get_token])) #done

    @app.route('/user',                         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_infos])) #done
    @app.route('/user',                         ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_update])) #done
    @app.route('/user',                         ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_disable])) #done
    @app.route('/user/invite',                  ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_invite, ])) #done
    @app.route('/user/<>',                      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_infos])) #done
    @app.route('/user/<>/role',                 ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_role])) #done
    @app.route('/user/<>/role',                 ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_set_role])) #done

    @app.route('/registery',                    ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, ]))
    @app.route('/registery',                    ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_is_admin, regi_create])) #done

    @app.route('/registery/<>',                 ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_infos])) #done
    @app.route('/registery/<>',                 ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_delete])) #done

    @app.route('/registery/<>/name',            ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_get_name])) #done
    @app.route('/registery/<>/name',            ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_set_name])) #done
    @app.route('/registery/<>/open',            ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_set_open])) #done

    @app.route('/registery/<>/roles',           ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_roles])) #done
    @app.route('/registery/<>/role',            ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_add_role])) #done
    @app.route('/registery/<>/role/<>',         ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_edit_role])) #done
    @app.route('/registery/<>/role/<>',         ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_delete_role])) #done

    @app.route('/registery/<>/actions',         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_actions])) #done
    @app.route('/registery/<>/action',          ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_add_action])) #done
    @app.route('/registery/<>/action/<>',       ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_delete_action])) #done

    @app.route('/extern/key',                   ['OPTIONS', 'GET'],         lambda x = None: call([user_get_key])) #done
    @app.route('/extern/key/<>/token',          ['OPTIONS', 'POST'],        lambda x = None: call([user_wait_token])) #done

    @app.route('/registeries/<>/key/<>/signin', ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_get_token])) #done

    @app.route('/user/password/reset',          ['OPTIONS', 'POST'],        lambda x = None: call([user_tmp_spoof, user_password_reset])) #done not imp
    @app.route('/user/password/change',         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_password_reset])) #done not imp
    @app.route('/user/password/change',         ['OPTIONS', 'POST'],        lambda x = None: call([user_tmp_spoof, user_password_change])) # done not imp

    @app.route('/card',                         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/card',                         ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/card/<>',                      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/card/<>',                      ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token]))

    @app.route('/order/',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/orderdetail/',                 ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/history/',                     ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/payments/',                    ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/paymentdetails/',              ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    def base():
        return
