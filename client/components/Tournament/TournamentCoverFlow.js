import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import Carousel from "react-native-carousel-control";
import { Card } from "react-native-elements";

const styles = StyleSheet.create({
  bigBlue: {
    color: "blue",
    fontWeight: "bold",
    fontSize: 30
  },
  container: {
    borderRadius: 10
  },
  image: {
    width: 270,
    height: 270,
    marginTop: 10,
    marginBottom: 10
  },
  loadingGIF: {
    width: 340,
    height: 250,
    marginTop: 10,
    marginBottom: 10
  }
});

export class TournamentCoverFlow extends React.Component {
  constructor(props) {
    super(props);

    this.getFetchPoint = this.getFetchPoint.bind(this);
    this.setFeaturedCards = this.setFeaturedCards.bind(this);

    this._isMounted = false;

    this.state = {
      showLoading: true
    };

    this.httpGetHeaders = {};
    this.featuredCards = [];
    this.loadingGIF = (
      <Image
        resizeMode="cover"
        style={styles.loadingGIF}
        source={{ uri: "http://www.certainty3d.com/images/loader.gif" }}
      />
    );

    this.headerFontSize = 21;
  }

  getFetchPoint(callback) {
    fetch(global.server + this.props.fetchPoint, {
      method: "GET",
      headers: this.httpGetHeaders
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        callback(responseJson);
      })
      .catch(error => {
        console.error("Fetch error: " + error);
      });
  }

  setFeaturedCards(featuredJSON) {
    if (!this._isMounted) {
      return;
    }
    featuredJSON.map(tournamentInfo => {
      this.featuredCards.push([
        <View key={tournamentInfo.tournament_id}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("Tournament", {
                tournamentID: tournamentInfo.tournament_id
              })
            }
          >
            <Card containerStyle={styles.container}>
              <View>
                <Image
                  resizeMode="cover"
                  style={styles.image}
                  source={{
                    uri: tournamentInfo.ext_icon_url
                      ? tournamentInfo.ext_icon_url
                      : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
                  }}
                />
                <Text
                  style={{
                    alignContent: "center",
                    textAlign: "center",
                    color: "#000000",
                    fontSize:
                      Math.min((this.headerFontSize * 20) / tournamentInfo.name.length, 50)
                  }}
                >
                  {tournamentInfo.name}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      ]);
    });
    if (this._isMounted === true) {
      this.setState({
        showLoading: false
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this.getFetchPoint(this.setFeaturedCards);
  }

  componentWillMount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Carousel sneak={40} pageStyle={{ borderRadius: 20 }}>
        {this.state.showLoading ? this.loadingGIF : this.featuredCards}
      </Carousel>
    );
  }
}
