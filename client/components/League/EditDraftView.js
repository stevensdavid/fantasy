import React from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";

export default class EditDraftView extends React.Component {
  static navigationOptions = {
    title: "Edit draft"
  };

  constructor(props) {
    super(props);
    this.state = {
      league: {},
      draft: [],
      entrants: [],
      formattedDraft: [],
      formattedEntrants: [],
      loading: true
    };
    console.log("State: " + JSON.stringify(this.state));
    this.setFormattedLists = this.setFormattedLists.bind(this);
    this.getEntrants = this.getEntrants.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
  }

  componentDidMount() {
    let league = this.props.navigation.getParam("league", null);
    this.setState(
      {
        league: league,
        draft: league.fantasy_drafts.filter(x => x.user_id == global.userID)
      },
      () => {
        this.getEntrants()
          .then(newEntrants => {
            this.setState({
              entrants: this.state.entrants.concat(newEntrants)
            });
            this.setFormattedLists();
            this.setState({ loading: false });
          })
          .catch(err => {
            console.log(err);
          });
      }
    );
  }

  setFormattedLists() {
    this.setState({
      formattedDraft: this.state.draft.map(x => {
        return {
          key: x.player.player_id.toString(),
          title: x.player.tag,
          img_uri: x.player.ext_photo_url
            ? x.player.ext_photo_url
            : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
        };
      })
    });
    // Build a hashmap to enable checking if a player has been drafted
    // in O(1) by checking if the key is in the object
    let draftedPlayers = null;
    console.log(JSON.stringify(this.state));
    const reducer = (newObj, x) =>
      Object.assign(newObj, { [x.player.player_id]: x.player });
    if (this.state.league.is_snake) {
      draftedPlayers = this.state.league.fantasy_drafts.reduce(reducer, {});
    } else {
      draftedPlayers = this.state.draft.reduce(reducer, {});
    }
    this.setState({
      formattedEntrants: this.state.entrants
        .filter(x => !(x.player.player_id in draftedPlayers))
        .map(x => {
          return {
            key: x.player.player_id.toString(),
            title: x.player.tag,
            img_uri: x.player.ext_photo_url
              ? x.player.ext_photo_url
              : "https://cdn.cwsplatform.com/assets/no-photo-available.png",
            description: "Seed: " + x.player.seed
          };
        })
    });
  }

  async getEntrants() {
    let res = await fetch(
      global.server + "/entrants/" + this.state.league.event.event_id
    );
    return await res.json();
  }

  draftPlayer(playerID) {
    if (this.state.draft.length >= this.state.league.draft_size) {
      Alert.alert("Your draft is full, please remove a player.");
      return;
    }
    fetch(
      global.server +
        "/drafts/" +
        this.state.league.league_id +
        "/" +
        global.userID,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer " + global.token
        },
        body: JSON.stringify({
          playerId: playerID
        })
      }
    )
      .then(res => {
        if (res.status === 200) {
          global.newDraft = true;
          return res.json();
        } else {
          throw res.body;
        }
      })
      .then(newDraft => {
        this.setState({ draft: this.state.draft.concat(newDraft) });
        this.setFormattedLists();
        if (this.state.league.is_snake) {
          this.props.navigation.goBack();
        }
      })
      .catch(err => console.error(err));
  }

  removePlayer(playerID) {
    if (this.state.league.is_snake) {
      return;
    }
    fetch(
      global.server +
        "/drafts/" +
        this.state.league.league_id +
        "/" +
        global.userID,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer " + global.token
        },
        body: JSON.stringify({
          playerId: playerID
        })
      }
    )
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw res.body;
        }
      })
      .then(newDraft => {
        this.setState({
          draft: this.state.draft.filter(
            x => x.player.player_id != newDraft.player_id
          )
        });
        this.setFormattedLists();
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <View>
        <ScrollView>
          <Text style={styles.headerText}>Drafted players</Text>
          <ScrollableListContainer
            showSearchBar={true}
            data={this.state.formattedDraft}
            onItemClick={playerID => this.removePlayer(playerID)}
            loading={this.state.loading}
          />
          <View
            style={{
              borderBottomColor: "silver",
              borderBottomWidth: 2,
              marginTop: 10,
              marginBottom: 5,
              marginLeft: 7,
              marginRight: 7
            }}
          />
          <Text style={styles.headerText}>All players</Text>
          <ScrollableListContainer
            showSearchBar={true}
            data={this.state.formattedEntrants}
            onItemClick={playerID => this.draftPlayer(playerID)}
            loading={this.state.loading}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    alignSelf: "center"
  }
});
