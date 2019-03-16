import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { ImagePicker, Permissions } from "expo";
import { Icon } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";

export class ProfileView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      firstName: "",
      lastName: "",
      tag: "",
      nFollowing: 0,
      nFollowers: 0,
      nLeagues: 0,
      photo_path: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
      tagFontSize: 42,
      loading: false,
      infoTextSize: 24
    };

    this.reloadInfo = this.reloadInfo.bind(this);
    this.pickAndUploadPhoto = this.pickAndUploadPhoto.bind(this);
  }

  reloadInfo() {
    this.getUserInfo();
  }

  componentDidMount() {
    this.getUserInfo();
    this.subs = [
      this.props.navigation.addListener("didFocus", payload => {
        if (global.newUserInfo) {
          this.getUserInfo();
          global.newUserInfo = false;
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  httpGetHeaders = {};

  getUserInfo() {
    this.setState({ loading: true });
    fetch(global.server + "/users/" + global.userID, {
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
            hasPhoto = responseJSON.photo_path != null;
            this.setState({
              email: responseJSON.email,
              firstName: responseJSON.first_name,
              lastName: responseJSON.last_name,
              tag: responseJSON.tag,
              tagFontSize: Math.min((38 * 8) / responseJSON.tag.length, 60),
              nFollowing: responseJSON.following.length,
              nFollowers: responseJSON.followers.length,
              nLeagues: responseJSON.fantasy_leagues.length,
              photo_path: hasPhoto ? global.server + "/images/" + responseJSON.photo_path : null
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

  async pickAndUploadPhoto() {
    // Heavily inspired by https://stackoverflow.com/a/42521680
    const { status: cameraRollPerm } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );
    if (cameraRollPerm !== "granted") {
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1
    });
    if (result.cancelled) {
      return;
    }
    let localUri = result.uri;
    let filename = localUri.split("/").pop();
    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    console.log(type);
    if (
      !["image/jpeg", "image/jpg", "image/png"].includes(type.toLowerCase())
    ) {
      Alert.alert(
        "Unsupported file type, please choose a JPG, JPEG or PNG image"
      );
      return;
    }else {
      this.setState({
        photo_path: localUri
      });
    }

    // Upload the image using the fetch and FormData APIs
    let formData = new FormData();
    // Assume "photo" is the name of the form field the server expects
    formData.append("file", { uri: localUri, name: filename, type });
    try {
      result = await fetch(global.server + "/images/" + global.userID, {
        method: "POST",
        body: formData,
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "bearer " + global.token
        }
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Unsuccesful");
    }
    if (result.status !== 204) {
      text = await result.text();
      Alert.alert(text);
    }
  }

  render() {
    const rightArrow = (
      <Icon
        containerStyle={{
          height: 45,
          marginLeft: 2,
          marginBottom: 17,
          justifyContent: "center",
          alignSelf: "center",
          alignItems: "center"
        }}
        name="chevron-right"
        type="material"
        color="#222"
        size={45}
      />
    );

    return (
      <View>
        <Spinner
          visible={this.state.loading}
          textContent={"Loading..."}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={this.pickAndUploadPhoto}
          >
            <Image
              style={{ width: 100, height: 100, borderRadius: 10 }}
              resizeMode="cover"
              source={{
                uri:
                  this.state.photo_path != null
                    ? this.state.photo_path
                    : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
              }}
            />
          </TouchableOpacity>
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
            <Text style={{ marginLeft: 4, fontSize: 14, color: "#b3002d" }}>
              Score: 0
            </Text>
          </View>
        </View>
        <ScrollView>
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

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Followers")}
            >
              <View style={styles.linkContainer}>
                <Text
                  style={[styles.inputs, { fontSize: 20, fontWeight: "bold" }]}
                  underlineColorAndroid="transparent"
                >
                  Followers: {this.state.nFollowers}
                </Text>
                {rightArrow}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Following")}
            >
              <View style={styles.linkContainer}>
                <Text
                  style={[styles.inputs, { fontSize: 20, fontWeight: "bold" }]}
                  underlineColorAndroid="transparent"
                >
                  Following: {this.state.nFollowing}
                </Text>
                {rightArrow}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Leagues")}
            >
              <View style={styles.linkContainer}>
                <Text
                  style={[styles.inputs, { fontSize: 20, fontWeight: "bold" }]}
                  underlineColorAndroid="transparent"
                >
                  Leagues: {this.state.nLeagues}
                </Text>
                {rightArrow}
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableHighlight
                style={[styles.buttonContainer, styles.loginButton]}
                onPress={() =>
                  this.props.navigation.navigate("EditProfile", {
                    reload: this.reloadInfo
                  })
                }
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.loginText}>Edit</Text>
                  <Icon
                    containerStyle={{
                      marginLeft: 5,
                      alignSelf: "center",
                      alignItems: "center"
                    }}
                    name="edit"
                    type="material"
                    color="#eff"
                    size={18}
                  />
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                style={[styles.buttonContainer, styles.loginButton]}
                onPress={() => this.props.setToken(null)}
              >
                <Text style={styles.loginText}>Logout</Text>
              </TouchableHighlight>
            </View>
          </View>
        </ScrollView>
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
    borderBottomWidth: 1,
    width: 350,
    height: 45,
    marginBottom: 20,
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
