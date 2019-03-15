import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity
} from "react-native";
import { Card, Icon, SearchBar } from "react-native-elements";
import { HideAbleView } from "../View/HideAbleView";
import Swipeout from "react-native-swipeout";

/*Takes the following props:
    data: Array with objects each containing {key, img_uri(optional), title, description(Optional)}
    onItemClick(key): Function which handles the key of a clicked item.(Optional)
    style: Object holding React Native CSS for the container(Optional).
    rightButton: Enable swipe left to show rightButton React component(Optional)
    rightButtonClick(key): Function which handles the click of right button(must if rightButton is given)
    emptyText: Text to display if filtered list is empty(Optional)
    searchBarPlaceholder: self-explanatory
*/

export class ScrollableListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.data,
      search: ""
    };

    this.dataHolder = this.props.data;

    this.searchFilterFunction = this.searchFilterFunction.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data != this.props.data) {
      this.setState({
        show: this.props.data
      });
      this.dataHolder = this.props.data;
    }
  }

  searchFilterFunction(text) {
    this.setState({ search: text });
    const newData = this.dataHolder.filter(item => {
      const itemData = `${item.title.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    this.setState({ show: newData });
  }

  render() {
    return this.props.loading ? (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator
          animating={this.props.loading}
          size="large"
          color="#b3002d"
        />
      </View>
    ) : (
      <View style={this.props.style}>
        <HideAbleView
          hide={
            this.props.showSearchBar
              ? false || !(this.props.data.length > 0)
              : true
          }
        >
          <SearchBar
            placeholder= {this.props.searchBarPlaceholder? this.props.searchBarPlaceholder : "Search"}
            onChangeText={text => this.searchFilterFunction(text)}
            containerStyle={styles.searchContainer}
            value={this.state.search}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            placeholderTextColor="#b3002d"
          />
        </HideAbleView>
        <FlatList
          data={this.state.show}
          renderItem={({ item }) => (
            <Swipeout
              disabled={this.props.rightButton ? false : true}
              right={[
                {
                  backgroundColor: "transparent",
                  component: this.props.rightButton,
                  onPress: () => {
                    this.props.rightButtonClick(item.key);
                  }
                }
              ]}
              autoClose={true}
              backgroundColor="transparent"
            >
              <TouchableOpacity
                onPress={() => {
                  this.props.onItemClick
                    ? this.props.onItemClick(item.key)
                    : {};
                }}
              >
                <Card containerStyle={styles.cardContainer}>
                  <View style={{ flexDirection: "row" }}>
                    {item.img_uri ? (
                      <Image
                        resizeMode="cover"
                        style={styles.image}
                        source={{ uri: item.img_uri }}
                      />
                    ) : (
                      <View />
                    )}
                    <View style={{ justifyContent: "center" }}>
                      <Text style={[styles.headerText, item.titleStyle]}>{item.title + " " + (item.status ? item.status : '')}</Text>
                      <Text style={styles.descriptionText}>
                        {item.description ? item.description : ""}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </Swipeout>
          )}
        />
        <HideAbleView style={{alignItems: 'center', justifyContent:'center'}} hide={!(this.props.emptyText && this.state.show.length === 0)}>
          <Text style={{fontSize: 21}}>{this.props.emptyText}</Text>
        </HideAbleView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff"
  },
  cardContainer: {
    minHeight: 120,
    borderRadius: 10
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 5
  },
  headerText: {
    marginLeft: 10,
    marginRight: 70,
    fontSize: 21,
    fontWeight: "bold"
  },
  descriptionText: {
    marginLeft: 10,
    marginRight: 70,
    fontSize: 12,
    fontWeight: "bold"
  },
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
