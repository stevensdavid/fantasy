import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    TouchableHighlight,
    Image,
    Alert,
    Platform
  } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

export class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           email: '',
           name: '',
           tag: '',
           firstName: '',
           lastName: '',
           password: '',
           passwordConfirm: '',
           loading: false,
        }
    }

    onClickListener = (viewId) => {
        Alert.alert("Alert", "Button pressed "+viewId);
    }

    tryCreateUser(stateInfo) {
      this.setState({
        loading: true
      });
      if(stateInfo.password !== stateInfo.passwordConfirm) {
        Alert.alert("Alert", "Passwords don't match!");
        this.setState({
          loading: false
        });
        return;
      }
      fetch(global.server + '/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: stateInfo.email,
          firstName: stateInfo.firstName,
          lastName: stateInfo.lastName,
          pw: stateInfo.password,
          tag: stateInfo.tag,
        })
      }).then((response) => {
        console.log(response);
        if(response.status === 404 || response.status === 400) {
          this.setState({
            loading: false
          });
          Alert.alert("Alert", "Invalid input!");
          return;
        } else if (response.status === 200) {
          this.tryLogin(this.state.email, this.state.password)
        }
      })
      .catch((error) => {
        this.setState({
          loading: false
        });
        console.error('Login error: ' + error);
      });
    }

    tryLogin (ema,pass) {
      fetch(global.server + '/login', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: ema, pw: pass})
      })
      .then((response) => {
        if(response.status === 404 || response.status === 400) {
          Alert.alert(
            'Invalid input!',
            'Please check your input.',
            [
              {text: 'OK', onPress: () => this.setState({loading: false})}
            ],
            { cancelable: false }
          )
        } else if (response.status === 200) {
          response.json().then((respjson) => {
            this.setState({
              loading: false
            })
            global.userID = respjson.userId;
            this.props.setToken(respjson.token); 
          })
        }
      })
      .catch((error) => {
        this.setState({
          loading: false
        });
        console.error('Login error: ' + error);
      });
    }

  render() {

    return (
        <View style={styles.container}>
          <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
            <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="First Name"
                    keyboardType="default"
                    underlineColorAndroid='transparent'
                    onChangeText={(firstName) => this.setState({firstName})}/>
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Last Name"
                    keyboardType="default"
                    underlineColorAndroid='transparent'
                    onChangeText={(lastName) => this.setState({lastName})}/>
              </View>

              <View style={styles.inputContainer}>
              <TextInput style={styles.inputs}
                  placeholder="Tag"
                  keyboardType="default"
                  underlineColorAndroid='transparent'
                  onChangeText={(tag) => this.setState({tag})}/>
                </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Email"
                    keyboardType="email-address"
                    underlineColorAndroid='transparent'
                    onChangeText={(email) => this.setState({email})}/>
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Password"
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    onChangeText={(password) => this.setState({password})}/>
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    onChangeText={(passwordConfirm) => this.setState({passwordConfirm})}/>
              </View>
      
              <TouchableHighlight disabled={this.state.loading} style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.tryCreateUser(this.state)}>
                <Text style={styles.loginText}>Register</Text>
              </TouchableHighlight>
      
              <TouchableHighlight disabled={this.state.loading} style={styles.buttonContainer} onPress={() => this.props.setRegister(false)}>
                  <Text>Back</Text>
              </TouchableHighlight>
            </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      marginTop: 300,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#DCDCDC',
    },
    spinnerTextStyle: {
      color: '#FFF',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        width:250,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center'
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
    },
    inputIcon:{
      width:30,
      height:30,
      marginLeft:15,
      justifyContent: 'center'
    },
    buttonContainer: {
      height:45,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom:20,
      width:250,
      borderRadius:30,
    },
    loginButton: {
      backgroundColor: "#b3002d",
    },
    loginText: {
      color: 'white',
    }
  });
