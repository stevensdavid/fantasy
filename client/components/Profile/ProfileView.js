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
  }

  render() {
    return (
      <View>
      <View style={styles.headerContent}>
        <Icon name= 'portrait' type='material' 
              color='black' size={104}/>
        <View>
        <Text style={styles.headerText}
            underlineColorAndroid='transparent'>
            #Tag
        </Text>
        <Text style={({fontSize: 14, color:'#b3002d'})}>Score: 0</Text>
        </View>
        <TouchableHighlight style={[styles.buttonContainer]} onPress={() => this.props.setEditing(true)}>
          <Icon name= 'edit' type='material' 
              color='silver' size={42}/>
        </TouchableHighlight>
      </View>
      <View style={styles.container}>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    First name
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    Last name
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.inputs}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'>
                    Email
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

              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.props.setToken(null)}>
                <Text style={styles.loginText}>Logout</Text>
              </TouchableHighlight>
              
            </View>
            </View>
    );
  }
}

const styles = StyleSheet.create({
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
  headerText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginLeft: 4,
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
