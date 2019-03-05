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

export class ProfileView extends React.Component {
  constructor(props) {
    super(props);

    this.state={
      email: '',
      firstName: '',
      lastName: '',
      tag: '',
      tagFontSize: 42,
    }

    this.getUserInfo();
  }

  httpGetHeaders = {};

  getUserInfo() {
    fetch(global.server + "/users/" + global.userID, {
      method: 'GET',
      headers: this.httpGetHeaders
    }).then((response) => {
      console.log(response);
      if(response.status === 404 || response.status === 400) {
        Alert.alert("Alert", "USER OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!");
      } else if(response.status === 200) {
        response.json().then((responseJSON) => {
          this.setState({
            email: responseJSON.email,
            firstName: responseJSON.first_name,
            lastName: responseJSON.last_name,
            tag: responseJSON.tag,
            tagFontSize: (42 * 8) / responseJSON.tag.length
          });
        })
      }
    }).catch((error) => {
      console.error('GET user error: ' + error);
    });
  }

  render() {
    return (
      <View>
      <View style={styles.headerContent}>
        <Icon name= 'portrait' type='material' 
              color='black' size={104}/>
        <View style={{marginRight: 80}}>
        <Text style={{fontWeight: 'bold', marginLeft: 4, fontSize: this.state.tagFontSize}}
            underlineColorAndroid='transparent'>
            #{this.state.tag}
        </Text>
        <Text style={({fontSize: 14, color:'#b3002d'})}>Score: 0</Text>
        </View>
      </View>
      <View style={styles.container}>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    {this.state.firstName}
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    {this.state.lastName}
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    {this.state.email}
                </Text>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    Info
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    Info
                </Text>
              </View>

              <View style={{flexDirection: 'row'}}>
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.props.setEditing(true)}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.loginText}>Edit</Text>
                  <Icon containerStyle={{marginLeft: 5, alignSelf:'center', alignItems:'center'}} name='edit' type='material' color='#eff' size={18}/>
                </View>
              </TouchableHighlight>
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.props.setToken(null)}>
                <Text style={styles.loginText}>Logout</Text>
              </TouchableHighlight>
              </View>
          </View>
        </View>
    );
  }
}

styles = StyleSheet.create({
  container: {
    marginTop: 180,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
  },
  headerContent: {
    margin: 35,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
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
    marginRight: 10,
    width:100,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: "#b3002d",
  },
  loginText: {
    color: 'white',
  }
}); 