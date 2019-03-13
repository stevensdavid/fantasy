import React from "react";
import { View, Text} from "react-native";
import { ScrollableListContainer } from '../Container/ScrollableListContainer';

export default class FriendsView extends React.Component {
  static navigationOptions = {
    title: 'Add Friend',
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      userID: global.userID,
      loading: true
    };
  }

  render() {
    return (
      <View>
      </View>
    );
  }
}
