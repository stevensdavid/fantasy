import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  TouchableHighlight,
  Alert,
  Platform
} from "react-native";
import { Icon } from "react-native-elements";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

/*this.tryLogin(this.state.email, this.state.password)*/

export class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      email: "",
      password: "",
      emailFocus: false,
      passwordFocus: false,
      loading: false
    };

    this.tryLogin = this.tryLogin.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onClickListener = viewId => {
    Alert.alert("Alert", "Button pressed " + viewId);
  };

  tryLogin(ema, pass) {
    if (!this._isMounted) return;
    fetch(global.server + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ema, pw: pass })
    })
      .then(response => {
        if (!this._isMounted) return;
        if (response.status === 404 || response.status === 400) {
          Alert.alert("Invalid input!", "Wrong username or password.");
          this.setState({ loading: false });
        } else if (response.status === 200) {
          response.json().then(respjson => {
            if (!this._isMounted) return;
            this.setState({ loading: false });
            global.userID = respjson.userId;
            // TODO: Remove one of these two
            this.props.setToken(respjson.token);
            global.token = respjson.token;
            global.webSocket.emit('login', { userID: respjson.userId, token: respjson.token })
          });
        }
      })
      .catch(error => {
        console.error("Login error: " + error);
        if (!this._isMounted) return;
        this.setState({ loading: false });
      });
  }

  render() {
    const topIcon = this.state.loading ? (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator
          animating={this.state.loading}
          size="large"
          color="#b3002d"
        />
      </View>
    ) : (
        <Icon
          name={Platform.OS === "ios" ? "ios-lock" : "md-lock"}
          type="ionicon"
          color="#2a2a2a"
          size={72}
        />
      );

    return (
      <KeyboardAwareScrollView>
        <View
          style={styles.container}
          pointerEvents={this.state.loading ? "none" : "auto"}
        >
          <View style={styles.iconContainer}>{topIcon}</View>

          <View style={styles.inputContainer}>
            <Icon
              name={Platform.OS === "ios" ? "ios-mail" : "md-mail"}
              type="ionicon"
              color={this.state.emailFocus ? "black" : "silver"}
            />
            <TextInput
              ref={input => (this.emailInput = input)}
              onSubmitEditing={() => this.passwordInput.focus()}
              onFocus={() => {
                this.setState({ emailFocus: true });
              }}
              onBlur={() => {
                this.setState({ emailFocus: false });
              }}
              returnKeyType="next"
              blurOnSubmit={false}
              style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              onChangeText={email => this.setState({ email })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name={Platform.OS === "ios" ? "ios-key" : "md-key"}
              type="ionicon"
              color={this.state.passwordFocus ? "black" : "silver"}
            />
            <TextInput
              ref={input => (this.passwordInput = input)}
              onSubmitEditing={() =>
                this.tryLogin(this.state.email, this.state.password)
              }
              onFocus={() => {
                this.setState({ passwordFocus: true });
              }}
              onBlur={() => {
                this.setState({ passwordFocus: false });
              }}
              style={styles.inputs}
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry={true}
              underlineColorAndroid="transparent"
              onChangeText={password => this.setState({ password })}
            />
          </View>

          <TouchableHighlight
            style={[styles.buttonContainer, styles.loginButton]}
            onPress={() => {
              this.setState({ loading: true });
              this.tryLogin(this.state.email, this.state.password);
            }}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.buttonContainer}
            onPress={() =>
              this.props.navigation.navigate("Register", {
                tryLogin: this.tryLogin
              })
            }
          >
            <Text>Register</Text>
          </TouchableHighlight>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent"
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
    width: "100%",
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
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 250,
    borderRadius: 30
  },
  iconContainer: {
    height: 72,
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
