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

/*this.tryLogin(this.state.email, this.state.password)*/

export class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
           email: '',
           password: '',
           emailFocus: false,
           passwordFocus: false,
        }
    }

    onClickListener = (viewId) => {
        Alert.alert("Alert", "Button pressed "+viewId);
    }

    tryLogin (ema,pass) {
      fetch(global.server + '/login', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: ema, pw: pass})
      })
      .then((response) => {
        console.log(response);
        if(response.status === 400) {
          Alert.alert("Alert", "Invalid username or password");
        } else if (response.status === 200) {
          this.props.setToken(2);
        }
      })
      .catch((error) => {
        console.error('Login error: ' + error);
      });
    }
      
    render() {
        return (
            <View style={styles.container}>
              <View style={styles.inputContainer}>
              <Icon name= {Platform.OS === 'ios' ? 'ios-mail' : 'md-mail'} type='ionicon' 
              color={this.state.emailFocus ? 'black' : 'silver'}/>
                <TextInput 
                    onFocus={() => {this.setState({emailFocus: true})}}
                    onBlur={() => {this.setState({emailFocus: false})}}
                    style={styles.inputs}
                    placeholder="Email"
                    keyboardType="email-address"
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
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    onChangeText={(password) => this.setState({password})}/>
              </View>
      
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.props.setToken(2)}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableHighlight>
      
              <TouchableHighlight style={styles.buttonContainer} onPress={() => this.props.setRegister(true)}>
                  <Text>Register</Text>
              </TouchableHighlight>
            </View>
          );
    }
}

const styles = StyleSheet.create({
    container: {
      marginTop: 250,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#DCDCDC',
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
