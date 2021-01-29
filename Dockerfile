FROM python:3.9.1-buster as auth_back

MAINTAINER Courtel Eliot <eliot.courtel@wanadoo.fr>
WORKDIR /home/api

COPY ./back/src/requirements.txt ./
RUN pip3 install --upgrade -r requirements.txt

ENTRYPOINT python3 server.py;
