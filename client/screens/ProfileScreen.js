import React from 'react';
import { View, Text} from 'react-native';
import { LoginForm } from '../components/LoginForm';
import { ProfileView } from '../components/ProfileView';
import { RegisterForm } from '../components/RegisterForm';

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Profile',
  };

  constructor(props){
    super(props);

    this.setRegister = this.setRegister.bind(this);
    this.setToken = this.setToken.bind(this);

    this.state = { 
      register: global.register,
      token: global.token
    };
  }

  setRegister(reg) {
    global.register = reg;
    this.setState({
      register: reg
    })
  }

  setToken(tok) {
    global.token = tok;
    this.setState({
      token: tok
    })
  }

  render() {
    const loginComponent = <LoginForm setToken = {this.setToken} setRegister = {this.setRegister}></LoginForm>;
    const profileViewComponent = <ProfileView></ProfileView>;
    const registerComponent = <RegisterForm setRegister = {this.setRegister}></RegisterForm>;

    const show = this.state.token? profileViewComponent : loginComponent;

    return (
      <View>
        {this.state.register ? registerComponent : show} 
      </View>
    );
  }
}
