import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Text,
  Image,
  Alert,
  Dimensions
} from "react-native";
import { Icon } from "react-native-elements";
import { ScrollableListContainer } from "../Container/ScrollableListContainer";
import { AddButton } from "../Button/AddButton";
import { HideAbleView } from "../View/HideAbleView";

export default class EventView extends React.Component {
  static navigationOptions = {
    title: "Event"
  };

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      loading: true,
      eventInfo: {},
      icon_uri:
        "https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif",
      playerData: null,
      loadingPlayers: true,
      hasEntrants: false,
      token: global.token
    };

    this.fetchEventInfo = this.fetchEventInfo.bind(this);
    this.eventID = this.props.navigation.getParam("eventID", -1);
    this.tournamentName = this.props.navigation.getParam("tournamentName", -1);
    this.tournamentBanner = this.props.navigation.getParam(
      "tournamentBanner",
      -1
    );
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchEventInfo();

    this.subs = [
      this.props.navigation.addListener("didFocus", () => {
        this.state.token != global.token
          ? this.setState({ token: global.token })
          : {};
      })
    ];
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
    this._isMounted = false;
  }

  httpGetHeaders = {};

  fetchEventInfo() {
    this.setState({ loading: true });
    fetch(global.server + "/events/" + this.eventID, {
      method: "GET",
      headers: this.httpGetHeaders
    })
      .then(response => {
        if (!this._isMounted) return;
        if (response.status != 200 && response.status != 204) {
          Alert.alert(
            "ERROR!",
            "EVENT ID OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!",
            [{ text: "OK", onPress: () => this.setState({ loading: false }) }],
            { cancelable: false }
          );
        } else {
          response.json().then(event => {
            if (!this._isMounted) return;
            this.setState({
              eventInfo: {
                name: event.name,
                numEntrants: event.num_entrants,
                entrants: event.entrants,
                fantasyLeagues: event.fantasy_leagues,
                placements: event.placements,
                slug: event.slug,
                startAt: event.start_at,
                tournamentID: event.tournament,
                videogameID: event.videogame.videogame_id,
                tournamentName: this.tournamentName,
                videogameName: event.videogame.name,
                icon_uri: event.videogame.ext_photo_url
                  ? event.videogame.ext_photo_url
                  : "https://cdn.cwsplatform.com/assets/no-photo-available.png",
                banner_uri:
                  this.tournamentBanner != null
                    ? this.tournamentBanner
                    : "https://www.mackspw.com/c.1179704/sca-dev-vinson/img/no_image_available.jpeg?resizeid=4&resizeh=1280&resizew=2560"
              },
              playerData: event.entrants.map(p => {
                return {
                  key: p.player.player_id.toString(),
                  img_uri: p.player.ext_photo_url
                    ? p.player.ext_photo_url
                    : "https://cdn.cwsplatform.com/assets/no-photo-available.png",
                  title: p.player.tag,
                  description: p.seed
                };
              }),
              loading: false,
              loadingPlayers: false,
              hasEntrants:
                event.entrants !== undefined && event.entrants.length > 0
            });
          });
        }
      })
      .catch(error => {
        console.error("GET event info error: " + error);
        if (!this._isMounted) return;
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <ImageBackground
            resizeMode="cover"
            style={styles.bannerImage}
            source={{ uri: this.state.eventInfo.banner_uri }}
          />
          <View
            style={{
              borderBottomColor: "silver",
              borderBottomWidth: 2,
              marginTop: 5,
              marginBottom: 5,
              marginLeft: 7,
              marginRight: 7
            }}
          />
          <Text style={styles.headerTournamentText}>
            {this.state.eventInfo.tournamentName}
          </Text>
          <View
            style={{
              borderBottomColor: "silver",
              borderBottomWidth: 2,
              marginTop: 5,
              marginBottom: 5,
              marginLeft: 7,
              marginRight: 7
            }}
          />
          <View style={styles.iconImageContainer}>
            <Image
              resizeMode="cover"
              style={styles.iconImage}
              source={{ uri: this.state.eventInfo.icon_uri }}
            />
            <Text style={styles.headerVideogameText}>
              {this.state.eventInfo.name}
            </Text>
          </View>
          <AddButton
            text="Create Fantasy League"
            textStyle={{
              color: "white",
              margin: 15,
              fontSize: 18,
              fontWeight: "bold"
            }}
            containerStyle={{ alignItems: "center" }}
            buttonStyle={{ alignSelf: "center" }}
            onPress={() => {
              if(global.token || this.state.token) {
                this.props.navigation.navigate("CreateLeague", {
                  eventId: this.eventID
                })
              } else {
                Alert.alert("Info", "Log in before creating a league");
                this.props.navigation.navigate("Leagues");
              }
            }}
            containerStyle={{ margin: 10 }}
          />
          <HideAbleView hide={!this.state.hasEntrants}>
            <Text style={{ fontSize: 40, alignSelf: "center" }}>Entrants</Text>
            <ScrollableListContainer
              data={this.state.playerData}
              loading={this.state.loadingPlayers}
              showSearchBar={true}
            />
          </HideAbleView>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerVideogameText: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    marginRight: 120,
    fontSize: 26,
    fontWeight: "bold"
  },
  headerTournamentText: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    fontSize: 26,
    fontWeight: "bold"
  },
  container: {
    backgroundColor: "#fff"
  },
  iconImage: {
    width: 102,
    height: 135,
    marginRight: 10,
    marginLeft: 4,
    borderWidth: 2
  },
  bannerImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width / 2
  },
  iconImageContainer: {
    flexDirection: "row"
  },
  floatingButtonStyle: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 0,
    right: 0
  }
});
