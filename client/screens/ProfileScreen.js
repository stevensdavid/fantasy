import React from 'react';
import { View, Text} from 'react-native';
import { LoginForm } from '../components/Profile/LoginForm';
import { ProfileView } from '../components/Profile/ProfileView';
import { RegisterForm } from '../components/Profile/RegisterForm';

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
          editing: false,
        })
      }
    })

    this.setRegister = this.setRegister.bind(this);
    this.setToken = this.setToken.bind(this);
    this.setEditing = this.setEditing.bind(this);

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

  setEditing(edit) {
    this.setState({
      editing: edit
    })
  }

  render() {
    const loginComponent = <LoginForm setToken = {this.setToken} setRegister = {this.setRegister}></LoginForm>;
    const profileViewComponent = <ProfileView setEditing = {this.setEditing}></ProfileView>;
    const registerComponent = <RegisterForm setRegister = {this.setRegister}></RegisterForm>;

    const show = this.state.token? profileViewComponent : loginComponent;

    return (
      <View>
        {this.state.register ? registerComponent : show} 
      </View>
    );
  }
}
