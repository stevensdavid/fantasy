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
          register: global.register,
          token: global.token,
          userID: global.userID,
          editing: false,
        })
      }
    })

    this.setRegister = this.setRegister.bind(this);
    this.setToken = this.setToken.bind(this);
    this.setEditing = this.setEditing.bind(this);

    this.state = { 
      register: global.register,
      token: global.token,
      userID: global.userID,
      editing: false,
    };
  }

  componentWillUnmount () {
    this.navigationWillFocusListener.remove()
  }

  setRegister(reg) {
    global.register = reg;
    this.setState({
      register: reg
    })
  }

  setToken(tok) {
    this.setRegister(false)
    global.token = tok;
    this.setState({
      token: tok
    })
  }

  setEditing(edit) {
    this.setState({
      editing: edit
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
