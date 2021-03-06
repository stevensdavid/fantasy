import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from "react-native";
import { Icon } from "react-native-elements";
import { HideAbleView } from "../View/HideAbleView";

export default class FriendsView extends React.Component {
  static navigationOptions = {
    title: "User"
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      email: "",
      firstName: "",
      lastName: "",
      tag: "",
      nFriends: 0,
      nLeagues: 0,
      tagFontSize: 42,
      loading: true,
      infoTextSize: 24,
      isFollowing: false,
      photo_path: null
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
    this._isMounted = true;
    this.getFriendInfo(this.friendID);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  addFollow(friendID) {
    if (!this._isMounted) return;
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
        if (!this._isMounted) return;
        if (res.status === 200) {
          Alert.alert("Success!", "You now follow: " + this.state.tag);
          global.newUserInfo = true;
          this.setState({
            isFollowing: true,
            nFollowers: this.state.nFollowers + 1
          });
        } else {
          throw res.body;
        }
      })
      .catch(err => console.error(err));
  }

  deleteFollow(friendID) {
    if (!this._isMounted) return;
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
        if (!this._isMounted) return;
        if (res.status === 200) {
          Alert.alert("Success!", "You no longer follow: " + this.state.tag);
          global.newUserInfo = true;
          this.setState({
            isFollowing: false,
            nFollowers: this.state.nFollowers - 1
          });
        } else {
          throw res.body;
        }
      })
      .catch(err => console.error(err));
  }

  httpGetHeaders = {};

  getFriendInfo(id) {
    if (!this._isMounted) return;
    this.setState({ loading: true });
    fetch(global.server + "/users/" + id, {
      method: "GET",
      headers: this.httpGetHeaders
    })
      .then(response => {
        if (!this._isMounted) return;
        if (response.status === 404 || response.status === 400) {
          Alert.alert(
            "ERROR!",
            "USER OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!",
            [{ text: "OK", onPress: () => this.setState({ loading: false }) }],
            { cancelable: false }
          );
        } else if (response.status === 200) {
          response.json().then(responseJSON => {
            if (!this._isMounted) return;
            responseJSON.followers.map(follower => {
              console.log(follower.user_id);
              console.log(global.userID);
              if (follower.user_id === global.userID) {
                this.setState({ isFollowing: true });
              }
            });
            this.setState({
              email: responseJSON.email,
              firstName: responseJSON.first_name,
              lastName: responseJSON.last_name,
              tag: responseJSON.tag,
              tagFontSize: Math.min((38 * 8) / responseJSON.tag.length, 60),
              nFollowing: responseJSON.following.length,
              nFollowers: responseJSON.followers.length,
              nLeagues: responseJSON.fantasy_leagues.length,
              photo_path: responseJSON.photo_path,
              loading: false
            });
          });
        }
      })
      .catch(error => {
        console.error("GET user error: " + error);
        this.setState({ loading: false });
      });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator
            animating={this.state.loading}
            size="large"
            color="#b3002d"
          />
        </View>
      );
    }
    return (
      <View>
        <View style={styles.headerContent}>
          <Image
            style={{ width: 100, height: 100, borderRadius: 10 }}
            resizeMode="cover"
            source={{
              uri:
                this.state.photo_path != null
                  ? global.server + "/images/" + this.state.photo_path
                  : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
            }}
          />
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
            <Text style={{ marginLeft: 4, fontSize: 14, color: "#b3002d" }}>Score: 0</Text>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.inputs, { fontSize: this.state.infoTextSize }]}
              underlineColorAndroid="transparent"
            >
              Name: {this.state.firstName + " " + this.state.lastName} 
            </Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.inputs, { fontSize: this.state.infoTextSize }]}
              underlineColorAndroid="transparent"
            >
              Email: {this.state.email}
            </Text>
          </View>

          <TouchableOpacity>
            <View style={styles.linkContainer}>
              <Text
                style={[styles.inputs, { fontWeight: "bold" }]}
                underlineColorAndroid="transparent"
              >
                Followers: {this.state.nFollowers}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={styles.linkContainer}>
              <Text
                style={[styles.inputs, { fontWeight: "bold" }]}
                underlineColorAndroid="transparent"
              >
                Following: {this.state.nFollowing}
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
