import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import SocketIOClient from "socket.io-client";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { AddButton } from "../Button/AddButton";
import { HideAbleView } from "../View/HideAbleView";

export default class SnakeLeagueView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      league: {},
      data: [],
      turn: -1,
      done: false,
      isMounted: false
    };

    this.leagueID = this.props.navigation.getParam("leagueID", -1);
    this.socketIdentifier = {
      userID: global.userID,
      leagueID: this.leagueID,
      token: global.token
    };

    this.fetchLeagueInfo = this.fetchLeagueInfo.bind(this);
    this.joinedRoom = this.joinedRoom.bind(this);
    this.leftRoom = this.leftRoom.bind(this);
    this.turnChange = this.turnChange.bind(this);
    this.newDraft = this.newDraft.bind(this);
    this.newParticipant = this.newParticipant.bind(this);
    this.deletedParticipant = this.deletedParticipant.bind(this);
    this.connected = this.connected.bind(this);
    this.leagueRemoved = this.leagueRemoved.bind(this);
  }

  connected(users) {
    if (!this.state.isMounted) {
      return;
    }
    users.map(x => this.joinedRoom(x));
  }

  leftRoom(userID) {
    console.log(userID + " left the room");
    if (!this.state.isMounted) {
      return;
    }
    this.setState({
      data: this.state.data
        .map(x =>
          x.key == userID
            ? Object.assign(x, { titleStyle: { color: "gray" }, statusStyle: {color: "gray", fontSize: 12}, isOnline: 0 })
            : x
        )
        .sort((a, b) => b.isOnline - a.isOnline)
        .sort()
    });
  }

  joinedRoom(userID) {
    console.log(userID + " joined the room");
    if (!this.state.isMounted) {
      return;
    }
    this.setState({
      data: this.state.data
        .map(x =>
          x.key == userID
            ? Object.assign(x, { titleStyle: { color: "black" }, statusStyle: {color: "gray", fontSize: 12}, isOnline: 1 })
            : x
        )
        .sort((a, b) => b.isOnline - a.isOnline)
        .sort()
    });
  }

  turnChange(userID) {
    if (userID == null) {
      this.setState({
        data: this.state.data.map(x => Object.assign(x, { status: "" }))
      });
      this.setState({ done: true });
      return;
    }
    console.log(userID);
    this.setState({
      turn: userID
    });
    if (!this.state.isMounted) {
      return;
    }
    this.setState({
      data: this.state.data.map(x =>
        x.key == userID
          ? Object.assign(x, { status: "[DRAFTER]" })
          : Object.assign(x, { status: "" })
      )
    });
  }

  newDraft(draft) {
    console.log("New draft!");
    if (!this.state.isMounted) {
      console.log("returning");
      return;
    }
    this.setState({
      data: this.state.data.map(x =>
        x.key == draft.user.user_id
          ? Object.assign(x, {
              description: x.description + draft.player.tag + "\n"
            })
          : x
      )
    });
    this.setState({
      league: Object.assign(this.state.league, {
        fantasy_drafts: this.state.league.fantasy_drafts.concat(draft)
      })
    });
  }

  handlePress(userID) {
    if (userID == global.userID) {
      if (this.state.turn == global.userID) {
        this.props.navigation.navigate("EditDraft", {
          league: this.state.league
        });
      } else if (this.state.league.turn == null) {
        Alert.alert("Drafting is over");
      } else {
        Alert.alert("It is not your turn");
      }
    } else {
      this.props.navigation.push("Friend", { friendID: userID });
    }
  }

  componentDidMount() {
    global.webSocket.on("removed-from-league", this.leagueRemoved);
    global.webSocket.on("league-removed", this.leagueRemoved);
    this.setState({
      loading: true
    });
    this.subs = [
      this.props.navigation.addListener("didFocus", payload => {
        if (global.newParticipantsInfo) {
          global.newParticipantsInfo = false;
          this.componentDidMount();
        }
      })
    ];
    this.setState({ isMounted: true }, () => {
      this.fetchLeagueInfo(this.leagueID)
        .then(() => {
          const currentTime = Math.round(new Date().getTime() / 1000);
          this.setState({
            done: currentTime > this.state.league.event.start_at
          });
          this.socket = SocketIOClient(global.server + "/leagues", {
            secure: true,
            reconnect: true,
            transports: ["websocket"]
          });
          this.socket.on("connected", this.connected);
          this.socket.on("left-room", this.leftRoom);
          this.socket.on("joined-room", this.joinedRoom);
          this.socket.on("turn-change", this.turnChange);
          this.socket.on("new-draft", this.newDraft);
          this.socket.on("new-participant", this.newParticipant);
          this.socket.on("deleted-participant", this.deletedParticipant);

          this.socket.connect();
          this.socket.emit("join", this.socketIdentifier);
          // server should answer with joined-room
        })
        .catch(err => console.error(err));
    });
  }

  leagueRemoved(league) {
    if (league.league_id == this.leagueID) {
      this.props.navigation.goBack();
    }
  }

  newParticipant(user) {
    // A new user can't have a fantasy draft without triggering the new-draft event,
    // but they will have a fantasy result that needs to be appended to our state
    // and the user has to be appended to our presented data.
    this.setState({
      league: Object.assign(this.state.league, {
        fantasy_results: this.state.league.fantasy_results.concat({
          user: {
            photo_path: user.photo_path,
            tag: user.tag,
            user_id: user.user_id
          },
          score: null
        })
      })
    });
    this.setState(
      {
        data: this.state.data.concat({
          key: user.user_id.toString(),
          title: user.tag,
          titleStyle: { color: "gray" },
          statusStyle: {color: "gray", fontSize: 12},
          isOnline: 0,
          status: user.user_id == this.state.league.turn ? "[DRAFTER]" : "",
          score: null,
          img_uri:
            user.photo_path != null
              ? global.server + "/images/" + user.photo_path
              : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
        })
      },
      () => Alert.alert("League changed", `${user.tag} joined the league.`)
    );
  }

  deletedParticipant(userID) {
    let user = this.state.league.fantasy_results.filter(
      x => x.user.user_id == userID
    );
    if (user.length > 0) {
      // user should only contain one element
      // Remove the player from the league state
      this.setState({
        league: Object.assign(this.state.league, {
          fantasy_results: this.state.league.fantasy_results.filter(
            x => x.user.user_id != userID
          ),
          fantasy_drafts: this.state.league.fantasy_drafts.filter(
            x => x.user_id != userID
          )
        })
      });
      // Remove the player from data
      this.setState(
        { data: this.state.data.filter(x => x.key != userID) },
        () =>
          Alert.alert("League changed", `${user[0].user.tag} left the league.`)
      );
    }
  }

  componentWillUnmount() {
    this.setState({ isMounted: false });
    this.subs.forEach(sub => sub.remove());
    this.socket.emit("leave", this.socketIdentifier);
    global.webSocket.off("league-removed", this.leagueRemoved);
  }

  async fetchLeagueInfo(leagueID) {
    if (!this.state.isMounted) {
      console.log("return");
      return;
    }
    this.setState({
      loading: true
    });
    let league_obj = {};
    try {
      let res = await fetch(global.server + "/leagues/" + leagueID);
      league_obj = await res.json();
    } catch (err) {
      console.error(err);
    }

    this.setState({ league: league_obj });
    let participants = this.state.league.fantasy_results.reduce(
      (newObj, x) =>
        Object.assign(newObj, {
          [x.user.user_id]: {
            tag: x.user.tag,
            draft: [],
            score: null,
            photo_path: x.user.photo_path
          }
        }),
      {}
    );
    for (draft of this.state.league.fantasy_drafts) {
      participants[draft.user_id].draft.push(draft.player.tag);
    }
    for (result of this.state.league.fantasy_results) {
      participants[result.user.user_id].score = result.score;
    }
    const newData = Object.keys(participants).map(k => {
      return {
        key: k.toString(),
        title: participants[k].tag,
        titleStyle: { color: "gray" },
        statusStyle: {color: "gray", fontSize: 12},
        isOnline: k == global.userID ? 2 : 0,
        status:
          k == league_obj.turn
            ? "[DRAFTER]"
            : participants[k].score !== null
            ? ` (${participants[k].score}p)`
            : "",
        description: participants[k].draft
          ? participants[k].draft.join("\n") + "\n"
          : "",
        score: participants[k].score,
        img_uri:
          participants[k].photo_path != null
            ? global.server + "/images/" + participants[k].photo_path
            : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
      };
    });
    this.setState({
      data: newData
        .sort((a, b) => b.score - a.score)
        .sort((a, b) => b.isOnline - a.isOnline)
        .sort(),
      done:
        league_obj.turn == null || league_obj.event.start_at * 1000 < Date.now,
      loading: false
    });
    this.setState({ turn: this.state.league.turn });
  }

  render() {
    const draftText = (
      <HideAbleView hide={this.state.done} style={{ justifyContent: "center" }}>
        <Text style={{ color: "lightgray" }}> Draft > </Text>
      </HideAbleView>
    );

    return (
      <View style={{ flex: 1 }}>
        <Text style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}>
          {this.state.league.name}
        </Text>
        {this.state.league.fantasy_results && (
          <Text style={{ alignSelf: "center" }}>
            {`Owner: ${
              this.state.league.fantasy_results.find(
                x => x.user.user_id == this.state.league.owner
              ).user.tag
            }\n`}
            {`Draft size: ${this.state.league.draft_size}\n`}
            Snake draft
          </Text>
        )}
        {(this.state.done || this.state.turn == null) && (
          <Text style={{ alignSelf: "center", fontStyle: "italic" }}>
            Drafting closed
          </Text>
        )}
        <ScrollableListContainer
          onKeyShowRightCardComponent={global.userID}
          rightCardComponent={draftText}
          showSearchBar={true}
          style={{ flex: 1 }}
          loading={this.state.loading}
          data={this.state.data}
          onItemClick={userID => this.handlePress(userID)}
        />
        <AddButton
          hide={
            this.state.league.owner != global.userID ||
            this.state.loading ||
            this.state.league.turn == null ||
            this.state.done
          }
          buttonName="edit"
          containerStyle={styles.floatingButtonStyle}
          onPress={() =>
            this.props.navigation.navigate("LeagueParticipants", {
              leagueID: this.leagueID
            })
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  floatingButtonStyle: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 16,
    right: 26
  }
});
