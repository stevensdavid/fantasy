import React from 'react';
import { View, Text} from 'react-native';
import {TournamentSearch} from '../components/Tournament/TournamentSearch'


export default class SearchScreen extends React.Component {
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
      <TournamentSearch navigation={this.props.navigation}></TournamentSearch>
      </View>
    );
  }
}
