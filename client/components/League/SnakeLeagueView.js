import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import SocketIOClient from "socket.io-client";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { AddButton } from "../Button/AddButton";

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
    this.connected = this.connected.bind(this);
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
      data: this.state.data.map(x =>
        x.key == userID
          ? Object.assign(x, { titleStyle: { color: "gray" } })
          : x
      )
    });
  }

  joinedRoom(userID) {
    console.log(userID + " joined the room");
    if (!this.state.isMounted) {
      return;
    }
    this.setState({
      data: this.state.data.map(x =>
        x.key == userID
          ? Object.assign(x, { titleStyle: { color: "black" } })
          : x
      )
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
    if (userID == global.userID && this.state.turn == global.userID) {
      this.props.navigation.navigate("EditDraft", {
        league: this.state.league
      });
    } else {
      if (this.state.league.turn == null) {
        Alert.alert("Drafting is over");
      } else {
        Alert.alert("It is not your turn");
      }
    }
  }

  componentDidMount() {
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

          this.socket.connect();
          this.socket.emit("join", this.socketIdentifier);
          // server should answer with joined-room
        })
        .catch(err => console.error(err));
    });
  }

  componentWillUnmount() {
    this.setState({ isMounted: false });
    this.subs.forEach(sub => sub.remove());
    this.socket.emit("leave", this.socketIdentifier);
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
          [x.user.user_id]: { tag: x.user.tag, draft: [] }
        }),
      {}
    );
    for (draft of this.state.league.fantasy_drafts) {
      participants[draft.user_id].draft.push(draft.player.tag);
    }
    const newData = Object.keys(participants).map(k => {
      return {
        key: k.toString(),
        title: participants[k].tag,
        titleStyle: { color: "gray" },
        status: k == league_obj.turn ? "[DRAFTER]" : "",
        description: participants[k].draft
          ? participants[k].draft.join("\n") + "\n"
          : ""
      };
    });
    this.setState({
      data: newData,
      done: league_obj.turn == null || (league_obj.event.start_at * 1000 < Date.now),
      loading: false
    });
    this.setState({ turn: this.state.league.turn });
  }

  render() {
    return (
      <View>
        <View style={{ minHeight: "100%" }}>
          <Text
            style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}
          >
            {this.state.league.name}
          </Text>
          <ScrollableListContainer
            loading={this.state.loading}
            data={this.state.data}
            onItemClick={userID => this.handlePress(userID)}
          />
        </View>
        <View>
          <AddButton
            hide={
              this.state.league.owner != global.userID ||
              this.state.loading ||
              this.state.league.turn == null
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
