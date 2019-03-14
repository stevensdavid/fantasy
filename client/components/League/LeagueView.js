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
      data: [],
      loading: true,
      league: {}
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.leagueID = this.props.navigation.getParam("leagueID", -1);
    this.handlePress = this.handlePress.bind(this);
  }

  componentDidMount() {
    if (this.leagueID == -1) {
      console.error("LeagueView: League ID was not received successfully");
      return;
    }
    this.setState({ loading: false });
    fetch(global.server + '/leagues/' + this.leagueID).then(res => res.json())
      .then(league_obj => {
        this.setState({ league: league_obj })
        let participants = this.state.league.fantasy_results.reduce(
          (newObj, x) => Object.assign(
            newObj, { [x.user.user_id]: { tag: x.user.tag, draft: [] } }
          ), {}
        )
        for (draft of this.state.league.fantasy_drafts) {
          participants[draft.user_id].draft.push(draft.player.tag)
        }
        const newData = Object.keys(participants).map(k => {
          return {
            key: k.toString(),
            title: participants[k].tag,
            description: participants[k].draft.join("\n")
          }
        })
        this.setState({ data: newData })
        this.setState({ loading: false })
      }).catch(err => console.error(err));
  }

  handlePress(userID) {
    if (userID == global.userID) {
      this.props.navigation.navigate("EditDraft", {league: this.state.league})
    }
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
          onItemClick={(userID) => this.handlePress(userID)}
        />
        <AddButton hide={this.state.league.owner != global.userID || this.state.loading}
          buttonName = "edit"
          containerStyle={styles.floatingButtonStyle}
          onPress={() => this.props.navigation.navigate("LeagueParticipants", {leagueID: this.leagueID})} />
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