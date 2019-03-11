import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    Alert
  } from 'react-native';
  import Spinner from 'react-native-loading-spinner-overlay';

export default class EditProfile extends React.Component {
  static navigationOptions = {
    title: 'Edit Profile',
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
           loading: false,
        }

        this.tryEdit = this.tryEdit.bind(this);
        this.reload =  this.props.navigation.getParam("reload", -1);
    }

    clean(obj) {
      for (var propName in obj) { 
        if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
          delete obj[propName];
        }
      }
    }

    tryEdit(userInfo) {
      this.setState({
        loading: true
      });

      let user = {
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        pw: userInfo.password,
        tag: userInfo.tag
      };
      this.clean(user);

      if(userInfo.password !== userInfo.passwordConfirm) {
        Alert.alert(
          'Alert',
          "Passwords don't match",
          [
          {text: 'OK', onPress: () => this.setState({loading: false})}
          ],
          { cancelable: false }
        );
        this.setState({
          loading: false
        });
        return;
      } else if (user.length === 0) {
        Alert.alert(
          'Alert',
          "Empty input",
          [
          {text: 'OK', onPress: () => this.setState({loading: false})}
          ],
          { cancelable: false }
        );
        return;
      }

      //Valid info, let's update
      fetch(global.server + '/users/' + global.userID, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user)
      }).then((response) => {
        console.log(response);
        this.setState({loading: false});
        if(response.status === 404 || response.status === 400) { 
          Alert.alert(
            'Alert',
            "Email's already taken",
            [
            {text: 'OK', onPress: () => this.setState({loading: false})}
            ],
            { cancelable: false }
          );
          return;
        } else if (response.status === 200) {
          this.reload();
          this.props.navigation.goBack();
        }
      })
      .catch((error) => {
        this.setState({
          loading: false
        });
        console.error('Login error: ' + error);
      });
    }

    onClickListener = (viewId) => {
        Alert.alert("Alert", "Button pressed "+viewId);
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
                    onChangeText={(firstname) => this.setState({firstname})}/>
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Last Name"
                    keyboardType="default"
                    underlineColorAndroid='transparent'
                    onChangeText={(lastname) => this.setState({lastname})}/>
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
                    autoCapitalize="none"
                    onChangeText={(email) => this.setState({email})}/>
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Password"
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    autoCapitalize="none"
                    onChangeText={(password) => this.setState({password})}/>
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.inputs}
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    underlineColorAndroid='transparent'
                    onChangeText={(passwordConfirm) => this.setState({passwordConfirm})}/>
              </View>
      
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.tryEdit(this.state)}>
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
      justifyContent: 'center',
      alignItems: 'center',
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
