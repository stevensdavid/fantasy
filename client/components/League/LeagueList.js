import React from "react";
import { View, StyleSheet, Alert } from "react-native";
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
            status: Math.round(new Date().getTime() / 1000) > league.event.tournament.ends_at ?
              "Finished" : "",
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
    let league = this.props.leagues.filter(x => x.league_id == selectedLeague)[0];
    if (league.is_snake) {
      this.props.navigation.navigate("SnakeLeague", { leagueID: selectedLeague });
    } else {
      this.props.navigation.navigate("League", { leagueID: selectedLeague });
    }
  }

  render() {
    const deleteButton = (
      <View
        style={[styles.buttonContainer, styles.deleteButton, {}]}
        onPress={() => this.props.onPress()}
      >
        <Icon
          containerStyle={{ alignSelf: "center"}}
          name="delete"
          type="material"
          color="#eff"
          size={42}
        />
      </View>
    );

    return (
      <View style={{ minWidth: "100%" }}>
        <ScrollableListContainer
          showSearchBar = {true}
          data={this.state.data}
          onItemClick={key => {
            this.openLeagueView(key);
          }}
          rightButton={deleteButton}
          rightButtonClick={leagueID => this.deleteLeague(leagueID)}
          loading={this.state.loading}
        />
        <AddButton
          hide={this.state.loading}
          containerStyle={styles.floatingButtonStyle}
          onPress={() => {
            Alert.alert("Info", "Select tournament and event to create a league");
            this.props.navigation.navigate("Search");
          }}
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
  },
  buttonContainer: {
    minHeight: 70,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf:'center',
    minWidth: 70,
    marginRight: 10,
    marginTop: "45%",
    borderRadius: 70 / 2
  },
  deleteButton: {
    backgroundColor: "#b3002d"
  }
});
