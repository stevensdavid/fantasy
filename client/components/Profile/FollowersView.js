import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";

export default class FollowersView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    title: "Followers"
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      userID: global.userID,
      loading: true
    };
  }

  componentDidMount() {
    this.fetchFollowers(this.state.userID);
  }

  fetchFollowers(userID) {
    newData = [];
    fetch(global.server + "/followers/" + userID + "?page=1&perPage=20", {
      method: "GET"
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw res;
        }
      })
      .then(friendsData => {
        if (friendsData.length > 0) {
          friendsData.map((friend) => {
            newData.push({
            key: friend.user_id.toString(),
            title: friend.tag,
            description: friend.first_name + " " + friend.last_name,
            img_uri: "https://cdn.cwsplatform.com/assets/no-photo-available.png"
          });
          });
        }
      })
      .then(() => {
        this.setState({
          data: newData,
          loading: false
        });
      })
      .catch(err => console.log(err));
  }

  render() {
    if(this.state.data.length > 0) { return (
      <View>
        <ScrollableListContainer
          data={this.state.data}
          loading={this.state.loading}
          showSearchBar={true}
          onItemClick={key =>
              this.props.navigation.push("Friend", { friendID: key })
            }
        />
      </View>
    );
  }else {
    return <Text style={styles.headerText}>No followers, Sad...</Text>
  }} 
}

const styles = StyleSheet.create({
  headerText: {
    marginTop: 20,
    fontSize: 24,
    alignSelf: "center"
  }
});
