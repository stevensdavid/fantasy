import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Carousel from "react-native-carousel-control";
import { Card} from 'react-native-elements';
import {TournamentView} from '../Tournament/TournamentView';

const styles = StyleSheet.create({
  bigBlue: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 30,
  },
  container: {
    borderRadius: 10,
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
    marginBottom: 10,
  }
});

let httpGetHeaders = {};

var featuredCards = [];
let loadingGIF = <Image
  resizeMode="cover"
  style={styles.loadingGIF}
  source={{uri: 'http://www.certainty3d.com/images/loader.gif'}}
  />

{/*backgroundColor: "#131862"*/}
export class TournamentCoverFlow extends React.Component {
  constructor(props){
    super(props);

    this.fetchPoint = this.fetchPoint.bind(this);
    this.setFeaturedCards = this.setFeaturedCards.bind(this);

    this.mounted = false;

    this.state = {
      showLoading: true,
    }

    this.headerFontSize= 21;
  }

  fetchPoint(callback) {
    fetch(global.server + this.props.fetchPoint, {
        method: "GET",
        headers: httpGetHeaders
      })
      .then((response) => {return response.json()})
      .then((responseJson) => {
        callback(responseJson);
      })
      .catch((error) => {
        console.error('Fetch error: ' + error);
      });
  }

  setFeaturedCards(featuredJSON) {
    if(this.mounted === false) {
      return;
    }
  featuredJSON.map( tournamentInfo => {
      featuredCards.push([
      <View key={tournamentInfo.tournament_id}>
      <TouchableOpacity onPress={() => this.props.navigation.navigate("Tournament", {tournamentID: tournamentInfo.tournament_id})}>
      <Card containerStyle={styles.container}>
      <View>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{uri: tournamentInfo.ext_icon_url ? tournamentInfo.ext_icon_url :'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif'}}
      />
      <Text style={{alignContent: 'center', textAlign: 'center', color: '#000000', 
      fontSize: (this.headerFontSize * 20 / tournamentInfo.name.length)}}>{tournamentInfo.name}</Text>
      </View>
      </Card>
      </TouchableOpacity>
      </View>
      ])
    })
    if(this.mounted === true) {
      this.setState({
        showLoading: false
      });
    }
    
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchPoint(this.setFeaturedCards);
  }

  componentWillMount() {
    this.mounted = false;
  }

  render() {
    return (
      <Carousel sneak={40} pageStyle={ {borderRadius: 20}}>
      {this.state.showLoading ? loadingGIF : featuredCards}
      </Carousel>)
  }
}
