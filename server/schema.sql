USE fantasy;

CREATE TABLE User
(
  user_id    INT AUTO_INCREMENT
    PRIMARY KEY,
  tag        VARCHAR(255) NOT NULL,
  first_name VARCHAR(50)  NULL,
  last_name  VARCHAR(50)  NULL,
  email      VARCHAR(255) NOT NULL,
  pw         VARCHAR(255) NOT NULL,
  photo_path VARCHAR(255),
  CONSTRAINT User_email_uindex
    UNIQUE (email)
);

CREATE TABLE Friends
(
  user_1 INT REFERENCES User,
  user_2 INT REFERENCES User,
  PRIMARY KEY (user_1, user_2)
);

CREATE TABLE Player
(
  player_id INT PRIMARY KEY,
  ranking   INT,
  tag       VARCHAR(255)
);

CREATE TABLE FantasyLeague
(
  league_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id  INT REFERENCES Event
);

CREATE TABLE Tournament
(
  tournament_id INT PRIMARY KEY ,
  name VARCHAR(255),
  slug VARCHAR(255)
);

CREATE TABLE Event
(
  event_id     INT PRIMARY KEY,
  tournament_id int references Tournament,
  name         VARCHAR(255),
  slug         VARCHAR(255),
  num_entrants INT,
  start_at     TIMESTAMP
);

CREATE TABLE Entrant
(
  event_id INT REFERENCES Event,
  player_id INT REFERENCES Player,
  seed INT,
  PRIMARY KEY(event_id, player_id)
);

CREATE TABLE FantasyDraft
(
  league_id INT REFERENCES FantasyLeague,
  user_id   INT REFERENCES User,
  player_id INT REFERENCES Player,
  PRIMARY KEY (league_id, user_id, player_id)
);

CREATE TABLE Placement
(
  event_id  INT REFERENCES Event,
  player_id INT REFERENCES Player,
  place     INT,
  PRIMARY KEY (event_id, player_id)
);

CREATE TABLE FantasyResult
(
  league_id INT REFERENCES FantasyLeague,
  user_id   INT REFERENCES User,
  score     INT,
  PRIMARY KEY (league_id, user_id)
);
