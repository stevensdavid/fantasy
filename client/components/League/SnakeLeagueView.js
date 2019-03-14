import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SocketIOClient from "socket.io-client";
import {ScrollableListContainer} from '../Container/ScrollableListContainer';
import {AddButton} from '../Button/AddButton';

export default class SnakeLeagueView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      league: {},
      data: []
    };

    this.socket = SocketIOClient(global.server, { nsp: "/leagues" });
    this.socket.on("left-room", this.leftRoom);
    this.socket.on("joined-room", this.joinedRoom);
    this.socket.on("turn-change", this.turnChange);
    this.socket.on("new-draft", this.newDraft);

    this.leagueID = this.props.navigation.getParam("leagueID", -1);
    this.socketIdentifier = {
      userID: global.userID,
      league_id: this.leagueID,
      token: global.token
    };

    // klienten ska skicka
    // join, leave

    // servern skickar
    // joined-room, left-room, turn-change, new-draft

    /*
    My draft
    []
    Available
    []


    My draft
    (DRAFT)
    []
    Adams draft
    []
    */
  }

  leftRoom() {}

  joinedRoom() {}

  turnChange() {}

  newDraft() {}

  componentDidMount() {
    this.socket.connect();
    this.socket.send("join", this.socketIdentifier);
    this.fetchLeagueInfo(this.leagueID);
    // server should answer with joined-room
  }

  componentWillUnmount() {
    this.socket.send("leave", this.socketIdentifier);
  }

  async fetchLeagueInfo(leagueID) {
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
        description: participants[k].draft.join("\n")
      };
    });
    this.setState({ data: newData, loading: false });
  }

  render() {
    return (
      <View style={{ minHeight: "100%" }}>
        <Text style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}>
          {this.state.league.name}
        </Text>
        <ScrollableListContainer
          loading={this.state.loading}
          data={this.state.data}
          onItemClick={userID => this.handlePress(userID)}
        />
        <AddButton
          hide={this.state.league.owner != global.userID || this.state.loading}
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
  mainContainerStyle: {
    flexDirection: "column",
    flex: 1
  },
  floatingButtonStyle: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 16,
    right: 26
  }
});