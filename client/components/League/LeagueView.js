import React from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Icon } from 'react-native-elements';
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { HideAbleView } from '../View/HideAbleView';
import { AddButton } from "../Button/AddButton";

export default class LeagueView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      league: {},
      entrants: [],
      data: [],
      loading: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.league = this.props.navigation.getParam("league", -1);
  }

  componentDidMount() {
    if (this.league === -1) {
      console.log("LeagueView: League ID was not received successfully");
      return;
    }
    this.getLeagueDetails(this.league)
      .then(league_res => {
        this.setState({ league: league_res });
        return this.getLeagueEntrants(league_res);
      })
      .then(entrants_res => {
        this.setState({ entrants: entrants_res, loading: false });
        this.setState({ data: this.createListData(entrants_res) });
        console.log(
          "Finished setting data: " + JSON.stringify(this.state.data)
        );
      })
      .catch(err => console.log(err));
  }

  async getLeagueDetails(league_id) {
    let res = await fetch(global.server + "/leagues/" + league_id, {
      method: "GET"
    });
    return res.json();
  }

  async getLeagueEntrants(league) {
    // League is an object in the schema specified by the League model in
    // the API
    let entrants = league.fantasy_results.map(x => x.user_id);
    let users = await Promise.all(
      entrants.map(async userId => {
        let res = await fetch(global.server + "/users/" + userId, {
          method: "GET"
        });
        if (res.status == 200) {
          return await res.json();
        } else {
          throw await res.text();
        }
      })
    );
    console.log(JSON.stringify(users));
    let userMap = {};
    let playerMap = {};
    for (user of users) {
      userMap[user.user_id] = user;
      userMap[user.user_id].draft = [];
    }
    for (draft of league.fantasy_drafts) {
      if (!draft.player in playerMap) {
        playerMap[player] = await (await fetch(
          global.server + "/players/" + draft.player,
          { method: "GET" }
        )).json();
      }
      userMap[draft.user].draft.push(playerMap[draft.player]);
    }
    console.log(JSON.stringify(userMap));
    return Object.values(userMap);
  }

  createListData(entrants) {
    let data = [];
    for (entrant of entrants) {
      data.push({
        key: entrant.user_id.toString(),
        title: entrant.tag,
        description: entrant.draft.map(player => player.tag).join("\n")
      });
    }
    return data;
  }

  render() {
    return (
      <View style={{minHeight: "100%"}}>
        <Text style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}>
          {this.state.league.name}
        </Text>
        <ScrollableListContainer loading={this.state.loading} data={this.state.data} />
        <AddButton hide={this.state.league.owner != global.userID || this.state.loading}
          containerStyle={styles.floatingButtonStyle}
          onPress={() => this.props.navigation.navigate("Search")} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    marginRight: 27,
    width: 50,
    borderRadius: 50
  },
  addButton: {
    backgroundColor: "#b3002d"
  },
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