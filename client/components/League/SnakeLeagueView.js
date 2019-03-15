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
      isMounted: false,
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
    if(!this.state.isMounted) {return}
    users.map(x => this.joinedRoom(x));
  }

  leftRoom(userID) {
    console.log(userID + " left the room");
    if(!this.state.isMounted) {return}
    this.setState({
      data: this.state.data.map(x => x.key  == userID ? 
        Object.assign(x, {titleStyle: {color: "gray"}})
        : x)
    });
  }

  joinedRoom(userID) {
    console.log(userID + " joined the room");
    if(!this.state.isMounted) {return}
    this.setState({
      data: this.state.data.map(x => x.key  == userID ? 
        Object.assign(x, {titleStyle: {color: "black"}})
        : x)
    });
  }

  turnChange(userID) {
    console.log(userID);
    this.setState({
      turn: userID
    });
    if(!this.state.isMounted) {return}
    this.setState({
      data: this.state.data.map(x => x.key  == userID? 
        Object.assign(x, {status: "[DRAFTER]"})
        : Object.assign(x, {status: ""}))
    });
  }

  newDraft(draft) {
    console.log("New draft!");
    if(!this.state.isMounted) { console.log("returning"); return}
    this.setState({
      data: this.state.data.map(x => x.key  == draft.user.user_id ? 
        Object.assign(x, {description: x.description + draft.player.tag + "\n"})
        : x)
    });
  }

  handlePress(userID) {
    if (userID == global.userID && this.state.turn == global.userID){
      this.props.navigation.navigate("EditDraft", {league: this.state.league});
    } else {
      Alert.alert('It is not your turn');
    }
  }

  componentDidMount() {
    this.setState({isMounted: true}, () => {
      this.fetchLeagueInfo(this.leagueID).then(() => {
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
      }).catch(err => console.error(err));   
    });
  }

  componentWillUnmount() {
    this.setState({isMounted: false});
    this.socket.emit("leave", this.socketIdentifier);
  }

  async fetchLeagueInfo(leagueID) {
    if(!this.state.isMounted) { console.log("return"); return}
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
        status: k == league_obj.turn ? "[DRAFT]" : "",
        description: participants[k].draft.join("\n")
      };
    });
    this.setState({ data: newData, loading: false });
    this.setState({ turn: this.state.league.turn });
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
  floatingButtonStyle: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 16,
    right: 26
  }
});
