import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";

export default class FriendsView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    title: "Friends",
    headerRight: (
      <TouchableOpacity onPress={() => navigation.navigate("AddFriend")}>
        <Icon
          containerStyle={{ alignSelf: "center", alignItems: "center", marginRight: 10 }}
          name="add"
          type="material"
          size={35}
          color="#b3002d"
        />
      </TouchableOpacity>
    )}
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
    this.fetchFriends(this.state.userID);
  }

  fetchFriends(userID) {
    newData = [];
    fetch(global.server + "/friends/" + userID + "?page=1&perPage=20", {
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
          newData.push({
            key: friendsData.user_id,
            title: friendsData.tag,
            description: friendsData.first_name + " " + friendsData.last_name,
            img_uri: "https://cdn.cwsplatform.com/assets/no-photo-available.png"
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
        />
      </View>
    );
  }else {
    return <Text style={styles.headerText}>No friends, why not follow one?</Text>
  }} 
}

const styles = StyleSheet.create({
  headerText: {
    marginTop: 20,
    fontSize: 24,
    alignSelf: "center"
  }
});
