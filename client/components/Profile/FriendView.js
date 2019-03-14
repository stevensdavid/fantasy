import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Alert,
  TouchableOpacity
} from "react-native";
import { Icon } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";
import { HideAbleView } from "../View/HideAbleView";

export default class FriendsView extends React.Component {
  static navigationOptions = {
    title: "User"
  };

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      firstName: "",
      lastName: "",
      tag: "",
      nFriends: 0,
      nLeagues: 0,
      tagFontSize: 42,
      loading: false,
      infoTextSize: 24,
      isFollowing: false
    };

    this.reloadInfo = this.reloadInfo.bind(this);
    this.addFollow = this.addFollow.bind(this);
    this.deleteFollow = this.deleteFollow.bind(this);

    this.friendID = this.props.navigation.getParam("friendID", -1);
  }

  reloadInfo() {
    this.getFriendInfo(this.friendID);
  }

  componentDidMount() {
    this.getFriendInfo(this.friendID);
  }

  addFollow(friendID) {
    fetch(global.server + "/friends/" + global.userID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + global.token
      },
      body: JSON.stringify({
        friendId: friendID
      })
    })
      .then(res => {
        if (res.status === 200) {
          Alert.alert("Success!", "You now follow: " + this.state.tag);
          this.setState({isFollowing: true});
        } else {
          throw res.body;
        }
      })
      .catch(err => console.error(err));
  }

  deleteFollow(friendID) {
    fetch(global.server + "/friends/" + global.userID, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + global.token
      },
      body: JSON.stringify({
        friendId: friendID
      })
    })
      .then(res => {
        if (res.status === 200) {
          Alert.alert("Success!", "You no longer follow: " + this.state.tag);
        } else {
          throw res.body;
        }
      })
      .catch(err => console.error(err));
  }

  httpGetHeaders = {};

  getFriendInfo(id) {
    this.setState({ loading: true });
    fetch(global.server + "/users/" + id, {
      method: "GET",
      headers: this.httpGetHeaders
    })
      .then(response => {
        if (response.status === 404 || response.status === 400) {
          Alert.alert(
            "ERROR!",
            "USER OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!",
            [{ text: "OK", onPress: () => this.setState({ loading: false }) }],
            { cancelable: false }
          );
        } else if (response.status === 200) {
          response.json().then(responseJSON => {
              responseJSON.followers.map((follower) => {
                  console.log(follower.user_id);
                  console.log(global.userID);
                  if (follower.user_id === global.userID) {
                    this.setState({isFollowing: true});
                  }
              });
            this.setState({
              email: responseJSON.email,
              firstName: responseJSON.first_name,
              lastName: responseJSON.last_name,
              tag: responseJSON.tag,
              tagFontSize: (38 * 8) / responseJSON.tag.length,
              nFriends: responseJSON.following.length,
              nLeagues: responseJSON.fantasy_leagues.length
            });
            this.setState({ loading: false });
          });
        }
      })
      .catch(error => {
        console.error("GET user error: " + error);
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <View>
        <Spinner
          visible={this.state.loading}
          textContent={"Loading..."}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.headerContent}>
          <Icon name="portrait" type="material" color="black" size={104} />
          <View style={{ marginRight: 80 }}>
            <Text
              style={{
                fontWeight: "bold",
                marginLeft: 4,
                fontSize: this.state.tagFontSize
              }}
              underlineColorAndroid="transparent"
            >
              #{this.state.tag}
            </Text>
            <Text style={{ fontSize: 14, color: "#b3002d" }}>Score: 0</Text>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.inputs, { fontSize: this.state.infoTextSize }]}
              underlineColorAndroid="transparent"
            >
              {this.state.firstName}
            </Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.inputs, { fontSize: this.state.infoTextSize }]}
              underlineColorAndroid="transparent"
            >
              {this.state.lastName}
            </Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.inputs, { fontSize: this.state.infoTextSize }]}
              underlineColorAndroid="transparent"
            >
              {this.state.email}
            </Text>
          </View>

          <TouchableOpacity>
            <View style={styles.linkContainer}>
              <Text
                style={[styles.inputs, { fontWeight: "bold" }]}
                underlineColorAndroid="transparent"
              >
                Friends: {this.state.nFriends}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={styles.linkContainer}>
              <Text
                style={[styles.inputs, { fontWeight: "bold" }]}
                underlineColorAndroid="transparent"
              >
                Leagues: {this.state.nLeagues}
              </Text>
            </View>
          </TouchableOpacity>

          <HideAbleView hide={this.state.isFollowing}>
            <TouchableHighlight
              style={[styles.buttonContainer, styles.loginButton]}
              onPress={() => this.addFollow(this.friendID)}
            >
              <Text style={styles.loginText}>Follow</Text>
            </TouchableHighlight>
          </HideAbleView>

          <HideAbleView hide={!this.state.isFollowing}>
            <TouchableHighlight
              style={[styles.buttonContainer, styles.loginButton]}
              onPress={() => this.deleteFollow(this.friendID)}
            >
              <Text style={styles.loginText}>Unfollow</Text>
            </TouchableHighlight>
          </HideAbleView>
        </View>
      </View>
    );
  }
}

styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },
  headerContent: {
    margin: 35,
    flexDirection: "row",
    alignItems: "center"
  },
  textContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  linkContainer: {
    zIndex: 1,
    height: 45,
    flexDirection: "row",
    marginBottom: 20,
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250
  },
  spinnerTextStyle: {
    color: "#FFF"
  },
  inputs: {
    fontSize: 26,
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF"
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: "center"
  },
  buttonContainer: {
    zIndex: 1,
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginRight: 10,
    width: 100,
    borderRadius: 30
  },
  loginButton: {
    backgroundColor: "#b3002d"
  },
  loginText: {
    color: "white"
  }
});
