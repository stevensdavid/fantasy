import React from 'react';
import { View, Text} from 'react-native';
import { LoginForm } from '../components/Profile/LoginForm';
import { ProfileView } from '../components/Profile/ProfileView';
import { RegisterForm } from '../components/Profile/RegisterForm';
import { EditProfile } from '../components/Profile/EditProfile';

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Profile',
  };

  constructor(props){
    super(props);

    this.navigationWillFocusListener = props.navigation.addListener('willFocus', () => {
      if(this.state.token !== global.token) {
        this.setState({
          token: global.token,
          userID: global.userID,
        })
      }
    })

    this.setToken = this.setToken.bind(this);

    this.state = { 
      token: global.token,
      userID: global.userID,
    };
  }

  componentWillUnmount () {
    this.navigationWillFocusListener.remove()
  }

  setToken(tok) {
    global.token = tok;
    this.setState({
      token: tok
    })
  }

  render() {
    const loginComponent = <LoginForm navigation={this.props.navigation} setToken = {this.setToken}></LoginForm>;
    const profileViewComponent = <ProfileView navigation={this.props.navigation} setToken = {this.setToken}></ProfileView>;

    let show = this.state.token? profileViewComponent : loginComponent;

    return (
      <View>
        {show}
      </View>
    );
  }
}
