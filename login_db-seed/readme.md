Extension of the socket.io-Chat-Example.

Additional features:
Check that username is unique
On Login the username is stored in a Mongo-Database.
On Logout the username is removed form the DB.

Implemented as Docker-Container-Network:
chat-Service:
Provides the socket.io-functionality extend with the uniquness-check of username
logindb:
Provides the Mongo-DB
logindb-seed:
Can be used to initially fill the DB with names. This names will be blocked for users.
monog-express:
Can be used to get web-access to the running mongo-DB.

Prerequiments:
Docker and Docker-Compose

Installation and Start:
In the App's root-folder run:
docker-compose build
docker-compose up

Visit localhost:80 to connect to the chat-service
Visit localhost:8081 to access the Webinterface of the Mongo-DB.
    username: basic
    password: PleaseChange

Username and Password can be set in the .env-file

Values for the initial filling of the database can be set in ./login_db-seed/init.json.

