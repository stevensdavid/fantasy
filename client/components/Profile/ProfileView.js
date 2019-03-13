import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Image,
    Alert,
    TouchableOpacity
  } from 'react-native';
import { Icon } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';

export class ProfileView extends React.Component {
  constructor(props) {
    super(props);

    this.state={
      email: '',
      firstName: '',
      lastName: '',
      tag: '',
      nFriends: 0,
      nLeagues: 0,
      tagFontSize: 42,
      loading: false,
    }

    this.reloadInfo = this.reloadInfo.bind(this);
  }

  reloadInfo() {
    this.getUserInfo();
  } 

  componentDidMount() {
    this.getUserInfo();
  }

  httpGetHeaders = {};

  getUserInfo() {
    this.setState({loading: true});
    fetch(global.server + "/users/" + global.userID, {
      method: 'GET',
      headers: this.httpGetHeaders
    }).then((response) => {
      if(response.status === 404 || response.status === 400) {
        Alert.alert(
          'ERROR!',
          'USER OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!',
          [
            {text: 'OK', onPress: () => this.setState({loading: false})}
          ],
          { cancelable: false }
        )
      } else if(response.status === 200) {
        response.json().then((responseJSON) => {
          console.log(responseJSON);
          this.setState({
            email: responseJSON.email,
            firstName: responseJSON.first_name,
            lastName: responseJSON.last_name,
            tag: responseJSON.tag,
            tagFontSize: (42 * 8) / responseJSON.tag.length,
            nFriends: responseJSON.following.length,
            nLeagues: responseJSON.fantasy_leagues.length
          });
          this.setState({loading: false});
        })
      }
    }).catch((error) => {
      console.error('GET user error: ' + error);
      this.setState({loading: false});
    });
  }

  render() {
    const rightArrow = (<Icon name="chevron-right"  type="material" color="#222" size={32} />)

    return (
      <View>
      <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
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
              
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Friends")}>
                <View style={styles.linkContainer}>
                  <Text style={[styles.inputs, {fontWeight: "bold"}]}
                      secureTextEntry={true}
                      underlineColorAndroid='transparent'>
                      Friends: {this.state.nFriends}
                  </Text>
                  <View>
                  {rightArrow}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.props.navigation.navigate("Leagues")}>
                <View style={styles.linkContainer}>
                  <View>
                  <Text style={[styles.inputs, {fontWeight: "bold"}]}
                      secureTextEntry={true}
                      underlineColorAndroid='transparent'>
                      Leagues: {this.state.nLeagues}
                  </Text>
                  </View>
                  {rightArrow}
                </View>
              </TouchableOpacity>

              <View style={{flexDirection: 'row'}}>
              <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.props.navigation.navigate("EditProfile", {reload: this.reloadInfo})}>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  linkContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius:30,
    borderBottomWidth: 1,
    width:250,
    height:45,
    marginBottom:20,
    flexDirection: 'row'
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
    zIndex: 1,
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
