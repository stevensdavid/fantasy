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
import { Icon } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';

/*this.tryLogin(this.state.email, this.state.password)*/

export class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
           email: '',
           password: '',
           emailFocus: false,
           passwordFocus: false,
           loading: false,
        }
    }

    onClickListener = (viewId) => {
        Alert.alert("Alert", "Button pressed "+viewId);
    }

    tryLogin (ema,pass) {
      this.setState({loading: true});
      fetch(global.server + '/login', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: ema, pw: pass})
      })
      .then((response) => {
        if(response.status === 404 || response.status === 400) {
          Alert.alert(
            'Invalid input!',
            'Wrong username or password.',
            [
              {text: 'OK', onPress: () => this.setState({loading: false})}
            ],
            { cancelable: false }
          )
        } else if (response.status === 200) {
          response.json().then((respjson) => {
            this.setState({loading: false});
            global.userID = respjson.userId;
            // TODO: Remove one of these two
            this.props.setToken(respjson.token);
            global.token = respjson.token;
          })
        }
      })
      .catch((error) => {
        console.error('Login error: ' + error);
        this.setState({loading: false});
      });
    }
      
    render() {
        return (
            <View style={styles.container}>
              <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
              <View style={styles.iconContainer}>
                <Icon name= {Platform.OS === 'ios' ? 'ios-lock' : 'md-lock'} type='ionicon' 
                color='#2a2a2a' size={72}/>
              </View>
              <View style={styles.inputContainer}>
              <Icon name= {Platform.OS === 'ios' ? 'ios-mail' : 'md-mail'} type='ionicon' 
              color={this.state.emailFocus ? 'black' : 'silver'}/>
                <TextInput 
                    onFocus={() => {this.setState({emailFocus: true})}}
                    onBlur={() => {this.setState({emailFocus: false})}}
                    style={styles.inputs}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    underlineColorAndroid='transparent'
                    onChangeText={(email) => this.setState({email})}/>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name={Platform.OS === 'ios' ? 'ios-key' : 'md-key'} type='ionicon' color={this.state.passwordFocus ? 'black' : 'silver'}/>
                <TextInput 
                    onFocus={() => {this.setState({passwordFocus: true})}}
                    onBlur={() => {this.setState({passwordFocus: false})}}
                    style={styles.inputs}
                    placeholder="Password"
                    autoCapitalize="none"
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    onChangeText={(password) => this.setState({password})}/>
              </View>
      
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.tryLogin(this.state.email, this.state.password)}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableHighlight>
      
              <TouchableHighlight style={styles.buttonContainer} onPress={() => this.props.navigation.navigate("Register")}>
                  <Text>Register</Text>
              </TouchableHighlight>
            </View>
          );
    }
}

const styles = StyleSheet.create({
    container: {
      marginTop:120,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
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
    spinnerTextStyle: {
      color: '#FFF',
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
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
    iconContainer: {
      height:72,
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
