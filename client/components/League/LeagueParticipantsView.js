import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SearchBar, Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";

export default class LeagueParticipantsView extends React.Component {
  static navigationOptions = {
    title: "Add League Participants"
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      data: [],
      participantsData: [],
      userID: global.userID,
      term: "",
    };

    this.fetchUsers = this.fetchUsers.bind(this);
    this.fetchParticipantsAndUsers = this.fetchParticipantsAndUsers.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.leagueId = this.props.navigation.getParam("leagueID", -1);
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchParticipantsAndUsers();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  addLeagueParticipant(userID) {
    fetch(global.server + "/fantasy_participants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + global.token
      },
      body: JSON.stringify({
        leagueId: this.leagueId,
        userId: userID
      })
    })
      .then(res => {
        if (!this._isMounted) return;
        if (res.status === 200) {
          global.newParticipantsInfo = true;
          this.componentDidMount();
        } else {
          throw res;
        }
      })
      .catch(err => console.log(err));
  }

  deleteLeagueParticipant(userID) {
    fetch(global.server + "/fantasy_participants", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + global.token
      },
      body: JSON.stringify({
        leagueId: this.leagueId,
        userId: userID
      })
    })
      .then(res => {
        if (!this._isMounted) return;
        if (res.status === 200) {
          global.newParticipantsInfo = true;
          this.componentDidMount();
        } else {
          throw res;
        }
      })
      .catch(err => console.log(err));
  }

  updateSearch = value => {
    if (!this._isMounted) return;
    this.setState({ term: value });
    this.fetchUsers(value);
  };

  fetchUsers(term) {
    newData = [];
    fetch(global.server + "/users?tag=" + term, {
      method: "GET"
    })
      .then(res => {
        if (!this._isMounted) return;
        if (res.status === 200) {
          return res.json();
        } else {
          throw res;
        }
      })
      .then(userData => {
        if (!this._isMounted) return;
        if (userData.length > 0) {
          userData.map(user => {
            if (user.user_id !== global.userID) {
              addUser = true;
              for(let participant of this.state.participantsData){                
                if(participant['key'] == user.user_id.toString()) {
                  addUser = false;
                }
              }
              if(addUser) {
                newData.push({
                  key: user.user_id.toString(),
                  title: user.tag,
                  description: user.first_name + " " + user.last_name,
                  img_uri:
                    user.photo_path != null
                      ? global.server + "/images/" + user.photo_path
                      : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
                });
              }
            }
          });
        }
      })
      .then(() => {
        if (!this._isMounted) return;
        this.setState({
          data: newData
        });
      })
      .catch(err => console.log(err));
  }

  fetchParticipantsAndUsers() {
    newParticipantsData = [];
    fetch(global.server + "/leagues/" + this.leagueId, {
      method: "GET"
    })
      .then(res => {
        if (!this._isMounted) return;
        if (res.status === 200) {
          return res.json();
        } else {
          throw res;
        }
      })
      .then(leagueData => {
        if (!this._isMounted) return;
        if (leagueData.fantasy_results.length > 0) {
          leagueData.fantasy_results.map(result => {
            if (result.user.user_id !== global.userID) {
              newParticipantsData.push({
                key: result.user.user_id.toString(),
                title: result.user.tag,
                img_uri:
                  result.user.photo_path != null
                    ? global.server + "/images/" + result.user.photo_path
                    : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
              });
            }
          });
        }
      })
      .then(() => {
        if (!this._isMounted) return;
        this.setState({
          participantsData: newParticipantsData
        }, () => this.fetchUsers(this.state.term));
      })
      .catch(err => console.log(err));
  }

  render() {
    const deleteButton = (
      <View
        style={[styles.buttonContainer, styles.button, {}]}
        onPress={() => this.props.onPress()}
      >
        <Icon
          containerStyle={{ alignSelf: "center" }}
          name="delete"
          type="material"
          color="#eff"
          size={42}
        />
      </View>
    );

    const addButton = (
      <View
        style={[styles.buttonContainer, styles.button, {}]}
        onPress={() => this.props.onPress()}
      >
        <Icon
          containerStyle={{ alignSelf: "center" }}
          name="add"
          type="material"
          color="#eff"
          size={42}
        />
      </View>
    );

    const leftArrow = (
      <View style={{ flexDirection: "row" }}>
        <Icon
          containerStyle={{
            height: 45,
            marginLeft: 2,
            marginBottom: 17,
            justifyContent: "center",
            alignSelf: "center",
            alignItems: "center"
          }}
          name="keyboard-backspace"
          type="material"
          color="gray"
          size={45}
        />
      </View>
    );

    return (
      <View style={{ flex: 1 }}>
        <ScrollableListContainer
          searchBarPlaceholder="Search participants..."
          style={{ maxHeight: 300 }}
          showSearchBar={true}
          emptyText="No participants"
          data={this.state.participantsData}
          rightButton={deleteButton}
          rightButtonClick={userID => this.deleteLeagueParticipant(userID)}
          rightCardComponent={leftArrow}
          onItemClick={key =>
            this.props.navigation.push("Friend", { friendID: key })
          }
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
        <View style={{ flex: 2 }}>
          <SearchBar
            placeholder="Search user..."
            onChangeText={this.updateSearch}
            value={this.state.term}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            placeholderTextColor="#b3002d"
          />
          <View style={{ flex: 2, marginBottom: 5 }}>
            <ScrollableListContainer
              emptyText="Nothing to show"
              data={this.state.data}
              rightButton={addButton}
              rightButtonClick={userID => this.addLeagueParticipant(userID)}
              rightCardComponent={leftArrow}
              onItemClick={key =>
                this.props.navigation.push("Friend", { friendID: key })
              }
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent"
  },
  searchInputContainer: {
    backgroundColor: "transparent",
    borderRadius: 20
  },
  searchInput: {
    color: "#b3002d"
  },
  buttonContainer: {
    minHeight: 70,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    minWidth: 70,
    marginRight: 10,
    marginTop: "45%",
    borderRadius: 70 / 2
  },
  button: {
    backgroundColor: "#b3002d"
  }
});
