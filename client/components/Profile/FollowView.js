import React from "react";
import { View, StyleSheet } from "react-native";
import { SearchBar } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";

export default class FollowView extends React.Component {
  static navigationOptions = {
    title: "Follow"
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      userID: global.userID,
      term: ""
    };

    this.fetchUsers = this.fetchUsers.bind(this);
  }

  componentDidMount() {
    this.fetchUsers(this.state.term);
  }

  updateSearch = (value) => {
        this.setState({term:  value});
        this.fetchUsers(value);
    };

  fetchUsers(term) {
    newData = [];
    this.setState({loading: true});
    fetch(global.server + "/users?tag=" + term, {
      method: "GET"
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw res;
        }
      })
      .then(userData => {
        if (userData.length > 0) {
          userData.map(user => {
            if (user.user_id !== global.userID) {
              newData.push({
                key: user.user_id.toString(),
                title: user.tag,
                description: user.first_name + " " + user.last_name,
                img_uri:
                  "https://cdn.cwsplatform.com/assets/no-photo-available.png"
              });
            }
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
    return (
      <View>
        <SearchBar
          placeholder="Search"
          onChangeText={this.updateSearch}
          value={this.state.term}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          placeholderTextColor="#b3002d"
        />
        <View style={{ marginBottom: 180 }}>
          <ScrollableListContainer
            emptyText = "Nothing to show"
            data={this.state.data}
            onItemClick={key =>
              this.props.navigation.push("Friend", { friendID: key })
            }
            loading={this.state.loading}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent"
  },
  searchInputContainer: {
    backgroundColor: "transparent",
    borderRadius: 20
  },
  searchInput: {
    color: "#b3002d"
  }
});
