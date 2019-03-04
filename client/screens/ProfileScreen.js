import React from 'react';
import { View, Text} from 'react-native';
import { LoginForm } from '../components/LoginForm';
import { ProfileView } from '../components/ProfileView';

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Profile',
  };

  constructor(props){
    super(props);
  }

  render() {
    const loginComponent = <LoginForm></LoginForm>;
    const ProfileViewComponent = <ProfileView></ProfileView>;

    return (
      <View>
        {global.token? ProfileViewComponent : loginComponent}
      </View>
    );
  }
}
