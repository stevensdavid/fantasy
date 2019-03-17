import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  ActivityIndicator
} from "react-native";

export default class EditProfile extends React.Component {
  static navigationOptions = {
    title: "Edit Profile"
  };

  constructor(props) {
    super(props);
    this.state = {
      email: null,
      name: null,
      tag: null,
      firstname: null,
      lastname: null,
      password: null,
      passwordConfirm: null,
      loading: false
    };

    this.tryEdit = this.tryEdit.bind(this);
    this.reload = this.props.navigation.getParam("reload", -1);
  }

  //Help functions
  clean(obj) {
    for (var propName in obj) {
      if (
        obj[propName] === null ||
        obj[propName] === undefined ||
        obj[propName] === ""
      ) {
        delete obj[propName];
      }
    }
  }

  size = function(obj) {
    var size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

  tryEdit(userInfo) {
    this.setState({
      loading: true
    });

    let user = {
      email: userInfo.email,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      pw: userInfo.password,
      tag: userInfo.tag
    };

    this.clean(user);

    if (userInfo.password !== userInfo.passwordConfirm) {
      this.setState({ loading: false }) 
      Alert.alert(
        "Alert",
        "Passwords don't match",
        [{ text: "OK"}],
        { cancelable: false }
      );
      this.setState({
        loading: false
      });
      return;
    } else if (this.size(user) == 0) {
      Alert.alert(
        "Alert",
        "Empty input",
        [{ text: "OK", onPress: () => this.setState({ loading: false }) }],
        { cancelable: false }
      );
      return;
    }

    //Valid info, let's update
    console.log(JSON.stringify(user));
    fetch(global.server + "/users/" + global.userID, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + global.token
      },
      body: JSON.stringify(user)
    })
      .then(response => {
        this.setState({ loading: false });
        console.log(response);
        if (response.status === 404 || response.status === 400) {
          Alert.alert(
            "Alert",
            "Something went wrong",
            [{ text: "OK", onPress: () => this.setState({ loading: false }) }],
            { cancelable: false }
          );
          return;
        } else if (response.status === 200) {
          this.reload();
          this.props.navigation.goBack();
        }
      })
      .catch(error => {
        this.setState({
          loading: false
        });
        console.error("Login error: " + error);
      });
  }

  onClickListener = viewId => {
    Alert.alert("Alert", "Button pressed " + viewId);
  };

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
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="First Name"
            keyboardType="default"
            underlineColorAndroid="transparent"
            onChangeText={firstname => this.setState({ firstName: firstname })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="Last Name"
            keyboardType="default"
            underlineColorAndroid="transparent"
            onChangeText={lastname => this.setState({ lastName: lastname })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="Tag"
            keyboardType="default"
            underlineColorAndroid="transparent"
            onChangeText={t => this.setState({ tag: t })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="Email"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            onChangeText={e_mail => this.setState({ email: e_mail })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="Password"
            secureTextEntry={true}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            onChangeText={pass => this.setState({ password: pass })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputs}
            placeholder="Confirm Password"
            secureTextEntry={true}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            onChangeText={passConfirm =>
              this.setState({ passwordConfirm: passConfirm })
            }
          />
        </View>

        <TouchableHighlight
          style={[styles.buttonContainer, styles.loginButton]}
          onPress={() => this.tryEdit(this.state)}
        >
          <Text style={styles.loginText}>Edit</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  inputContainer: {
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
    width: 250,
    borderRadius: 30
  },
  loginButton: {
    backgroundColor: "#b3002d"
  },
  loginText: {
    color: "white"
  }
});
