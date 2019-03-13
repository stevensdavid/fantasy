import React from "react";
import { View, StyleSheet, TouchableHighlight, Dimensions } from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { AddButton } from "../Button/AddButton";

export class LeagueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
    this.setLeagues = this.setLeagues.bind(this);
    this.render = this.render.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.leagues !== prevProps.leagues) {
      this.setState({ loading: true });
      this.setLeagues()
        .then(newData => {
          this.setState({ data: newData, loading: false });
        })
        .catch(err => console.log(err));
}
  }

  async setLeagues() {
    const newData = await Promise.all(
      this.props.leagues.map(async (league) => {
        try {
          let res = await fetch(global.server + "/events/" + league.event.event_id, {
            method: "GET"
          });
          let event = await res.json();
          res = await fetch(
            global.server + "/tournaments/" + event.tournament.tournament_id,
            { method: "GET" }
          );
          let tournament = await res.json();
          return {
            key: league.league_id.toString(),
            title: league.name,
            description: tournament.name + ": " + event.name,
            img_uri: tournament.ext_icon_url
          };
        } catch (err) {
          console.log(err);
          return;
        }
      })
    );
    return newData;
  }

  openLeagueView(leagueId) {
    this.props.navigation.navigate("League", { league: leagueId });
  }

  render() {

    return (
      <View style={{ minWidth: "100%" }}>
        <ScrollableListContainer
          data={this.state.data}
          onItemClick={key => {
            this.openLeagueView(key);
          }}

          loading={this.state.loading}
        />
        <AddButton hide={this.state.loading} containerStyle={styles.floatingButtonStyle} onPress={() => this.props.navigation.navigate("Search")} />
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
