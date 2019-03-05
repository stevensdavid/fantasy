import React from 'react';
import { View, Text} from 'react-native';


export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Search Tournaments',
  };

  constructor(props){
    super(props);

    this.state = { 
      register: global.register,
      token: global.token
    };
  }

  render() {
    return (
      <View>
        <Text>Hi</Text>
      </View>
    );
  }
}
