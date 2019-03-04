import React from 'react';
import {View, Text} from 'react-native';
import { LoginForm } from '../components/Profile/LoginForm';

export default class LeaguesScreen extends React.Component {
  static navigationOptions = {
    title: 'Leagues',
  };

  constructor(props){
    super(props);

    this.navigationWillFocusListener = props.navigation.addListener('willFocus', () => {
      if(this.state.token !== global.token) {
        this.setState({
          register: global.register,
          token: global.token
        })
      }
    })

    this.setRegister = this.setRegister.bind(this);
    this.setToken = this.setToken.bind(this);

    this.state = { 
      register: global.register,
      token: global.token
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
    global.token = tok;
    this.setState({
      token: tok
    })
  }

  render() {
    const loginComponent = <LoginForm setToken = {this.setToken} setRegister = {this.setRegister}></LoginForm>;
    return (
      <View>
      {this.state.token ? <Text>Logged in</Text> : loginComponent}
      </View>
      );
  }
}
