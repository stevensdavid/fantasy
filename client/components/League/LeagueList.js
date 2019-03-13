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
    this.render = this.render.bind(this);
    this.openLeagueView = this.openLeagueView.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.leagues !== prevProps.leagues) {
      this.setState({ loading: true });
      this.setState({
        data: this.props.leagues.map(league => {
          return {
            key: league.league_id.toString(),
            title: league.name,
            description:
              league.event.tournament.name + ": " + league.event.name,
            img_uri: league.event.tournament.ext_icon_url
          };
        }),
        loading: false
      });
    }
  }

  deleteLeague(leagueID) {
    fetch(global.server + "/leagues/" + leagueID, {
      method: "DELETE",
      headers: {
        Authorization: "bearer " + global.token
      }
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw res;
        }
      })
      .then(deletedLeague => {
        this.setState({
          data: this.state.data.filter(x => x.key != deletedLeague.league_id)
        });
      })
      .catch(err => console.log(err));
  }

  openLeagueView(selectedLeague) {
    this.props.navigation.navigate("League", { leagueID: selectedLeague });
  }

  render() {
    return (
      <View style={{ minWidth: "100%" }}>
        <ScrollableListContainer
          data={this.state.data}
          onItemClick={key => {
            this.openLeagueView(key);
          }}
          enableDeleteSwipe={true}
          onItemDelete={leagueID => this.deleteLeague(leagueID)}
          loading={this.state.loading}
        />
        <AddButton
          hide={this.state.loading}
          containerStyle={styles.floatingButtonStyle}
          onPress={() => this.props.navigation.navigate("Search")}
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
