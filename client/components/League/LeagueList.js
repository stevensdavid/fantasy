import React from "react";
import { View, StyleSheet, TouchableHighlight, Dimensions } from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { HideAbleView } from '../View/HideAbleView';

export class LeagueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
    this.setLeagues = this.setLeagues.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.render = this.render.bind(this);
  }

  /*componentDidMount() {
        this.setLeagues();
    }*/

  componentDidUpdate(prevProps) {
    if (this.props.leagues !== prevProps.leagues) {
      this.setState({ loading: true });
      this.setLeagues()
        .then(newData => {
          this.setState({ data: newData });
          this.setState({ loading: false });
          console.log(
            "LeagueList.componentDidUpdate is done: " +
              JSON.stringify(this.state.data)
          );
        })
        .catch(err => console.log(err));
    }
  }

  async setLeagues() {
    console.log(
      "LeagueList setting data: " + JSON.stringify(this.props.leagues)
    );

    const newData = await Promise.all(
      this.props.leagues.map(async league => {
        console.log("Handling league " + league.league_id);
        try {
          let res = await fetch(global.server + "/events/" + league.event, {
            method: "GET"
          });
          let event = await res.json();
          res = await fetch(
            global.server + "/tournaments/" + event.tournament,
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
    console.log(
      "LeagueList.setLeagues done setting data, newData is " +
        JSON.stringify(newData)
    );
    return this.state.data.concat(newData);
  }

  openLeagueView(leagueId) {
    this.props.navigation.navigate("League", { league: leagueId });
  }

  render() {

    return (
      <View style={{minWidth:"100%"}}>
        <ScrollableListContainer
          data={this.state.data}
          onItemClick={key => {
            this.openLeagueView(key);
          }}
          
          loading={this.state.loading}
        />
        <HideAbleView hide={this.state.loading}>
        <TouchableHighlight
          style={[
            styles.buttonContainer,
            styles.addButton,
            styles.floatingButtonStyle
          ]}
          onPress={() => this.props.navigation.navigate("Search")}
        >
          <Icon
            containerStyle={{
              alignSelf: "center",
              alignItems: "center"
            }}
            name="add"
            type="material"
            color="#eff"
            size={32}
          />
        </TouchableHighlight>
        </HideAbleView>
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
    bottom: 0,
    right: 0
  }
});
