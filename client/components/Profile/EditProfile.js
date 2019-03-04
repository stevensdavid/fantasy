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

export class EditProfile extends React.Component {
    constructor(props) {
        super(props);
        state = {
           email: '',
           name: '',
           tag: '',
           firstname: '',
           lastname: '',
           password: '',
           passwordConfirm: '',
        }
    }

    onClickListener = (viewId) => {
        Alert.alert("Alert", "Button pressed "+viewId);
    }

  render() {
    return (
        <View style={styles.container}>
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
      
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('Edit')}>
                <Text style={styles.loginText}>Edit</Text>
              </TouchableHighlight>
      
              <TouchableHighlight style={styles.buttonContainer} onPress={() => this.props.setEditing(false)}>
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
