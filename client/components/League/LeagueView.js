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
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.league = this.props.navigation.getParam("league", -1);
  }

  componentDidMount() {
    if (this.league === -1) {
      console.error("LeagueView: League ID was not received successfully");
      return;
    }
    let participants = this.league.fantasy_results.reduce(
      (newObj, x) => Object.assign(
        newObj, { [x.user.user_id]: { tag: x.user.tag, draft: [] } }
      ), {}
    )
    for (draft of this.league.fantasy_drafts) {
      partcipants[draft.user_id].draft.push(draft.player.tag)
    }
    console.log(JSON.stringify(participants))
    const newData = Object.keys(participants).map(k => {
      return {
        key: k.toString(),
        title: participants[k].tag,
        description: participants[k].draft.join("\n")
      }
    })
    this.setState({ data: newData })
    this.setState({ loading: false })
  }

  render() {
    return (
      <View style={{ minHeight: "100%" }}>
        <Text style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}>
          {this.league.name}
        </Text>
        <ScrollableListContainer loading={this.state.loading} data={this.state.data} />
        <AddButton hide={this.league.owner != global.userID || this.state.loading}
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