# SmashGG Fantasy
This repository is an application that was created as a project in the course DD1389 Internetprogramming 
at the KTH Royal Institute of Technology by @stevensdavid and @ruwaid123

It is a mobile application that interacts with the esport service [Smash.GG](https://www.smash.gg) by creating an automated system for creating fantasy leagues for any tournament that is hosted on Smash.GG.

## Client
The client is written in React Native using Expo, and works on both Android and iOS. It is currently hard-coded into communicating with the server through a specific URL.

### Requirements
The requirements are listed in `client/package.json` and can be installed by executing `npm i` in the `client` directory.

## Server
The server is written in Python using Flask and a MySQL database. It can be started by running the `server/main.py` script. It does, however, require a Smash.GG API token to be stored in the file `server/api_server/api_key` and a database URL to be stored in `server/database_url`. 

### Requirements
The requirements are listed in `server/requirements.txt` and can be installed by executing `pip3 install -r requirements.txt`, or through a virtual environment. 

## Screenshots
![Home screen](https://i.imgur.com/AD3grtZ.png)
![Tournament view](https://i.imgur.com/KDdhQVb.jpg)
![Fantasy league view](https://i.imgur.com/WpIkbS7.png)
![Event view](https://i.imgur.com/RYZefo3.jpg)
