import React from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { HideAbleView } from "../View/HideAbleView";
import { AddButton } from "../Button/AddButton";

export default class LeagueView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      league: {},
      done: false
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
    this.setState({ loading: true });
    fetch(global.server + "/leagues/" + this.leagueID)
      .then(res => res.json())
      .then(league_obj => {
        this.setState({
          league: league_obj,
          done: league_obj.event.start_at * 1000 < Date.now
        });
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
            status:
              participants[k].score !== null
                ? ` (${participants[k].score}p)`
                : "",
            description: participants[k].draft.join("\n"),
            score: participants[k].score,
            img_uri:
              participants[k].photo_path != null
                ? global.server + "/images/" + participants[k].photo_path
                : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
          };
        });
        this.setState({ data: newData.sort((a, b) => b.score - a.score) });
        const currentTime = Math.round(new Date().getTime() / 1000);
        this.setState({ done: currentTime > this.state.league.event.start_at });
        this.setState({ loading: false });
      })
      .catch(err => console.error(err));

    this.subs = [
      this.props.navigation.addListener("didFocus", payload => {
        if (global.newDraft || global.newParticipantsInfo) {
          global.newDraft = false;
          global.newParticipantsInfo = false;
          this.componentDidMount();
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  handlePress(userID) {
    if (userID == global.userID && !this.state.done) {
      this.props.navigation.navigate("EditDraft", {
        league: this.state.league
      });
    }
  }

  render() {
    return (
      <View style={{ minHeight: "100%", flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{ alignSelf: "center", fontSize: 32, fontWeight: "bold" }}
          >
            {this.state.league.name}
          </Text>
          {this.state.done && (
            <Text style={{ alignSelf: "center", fontStyle: "italic" }}>
              Drafting closed
            </Text>
          )}
          <ScrollableListContainer
            style={{ flex: 1 }}
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
