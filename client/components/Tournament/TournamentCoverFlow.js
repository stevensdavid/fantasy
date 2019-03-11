import React from 'react';
import { View, Image, Text, StyleSheet, TouchableHighlight } from 'react-native';
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
  getFeatured(callback) {
    fetch(global.server + '/featured', {
        method: "GET",
        headers: httpGetHeaders
      })
      .then((response) => response.json())
      .then((responseJson) => {
        callback(responseJson);
      })
      .catch((error) => {
        console.error('Fetch featured error: ' + error);
      });
  }

  /* 
    async setFeaturedCards(featuredJSON) {
    const imageURI = "https://images.smash.gg/images/tournament/55815/image-8ff562a5399c25df876c2af6b99a528a.png?fbclid=IwAR3B2aZF5iU5Cs4SIj1FCSr9Svj_5tXmD09g6QEZpm0DWTqFgVCG1fin5W8";
    const pArray = featuredJSON.map(async tournamentInfo => {
        await fetch('https://images.smash.gg/images/' + tournamentInfo.icon_path, {
        method: "GET",
        headers: httpGetHeaders
      }).then((response) => {
        console.log(response);
        //console.log(imageURI);
        featuredCards.push([
        <View key={tournamentInfo.tournament_id}>
        <Card containerStyle={styles.container}>
        <View>
        <Text style={styles.centerText}>{tournamentInfo.name}</Text>
        <Image
          resizeMode="cover"
          style={styles.image}
          source={{uri: imageURI}}
        />
        <Text>"Text goes here?"</Text>
        </View>
        </Card>
        <View style={{margin: 30}}>
        <Text>Etiam lacinia iaculis tincidunt. Nam varius, est non accumsan consectetur, ex orci vestibulum felis, non dictum est sapien vitae nulla. Phasellus nibh quam, consequat ac nisl ut, vulputate ornare tellus. Quisque euismod feugiat urna vitae tincidunt. Ut iaculis ornare lacus a posuere. Suspendisse potenti. Duis id accumsan diam. Nam ut lacus quis neque cursus sollicitudin eget fermentum nisl. Vestibulum non orci ac urna mattis pulvinar sit amet consequat ex. Curabitur non purus a dolor iaculis ullamcorper. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent mattis vel elit non consectetur.

        Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer et felis vitae lacus congue semper ac et diam. Aliquam erat volutpat. Aliquam pharetra eget leo eget pulvinar. Donec magna metus, eleifend vestibulum nisl nec, tincidunt tincidunt nulla. Vestibulum at rutrum velit, quis convallis nibh. Suspendisse at porta eros. Aenean blandit velit sed libero ullamcorper dictum. Fusce non mauris tellus. Etiam tincidunt lorem magna, eu tincidunt diam pretium eu. Sed volutpat tortor et ante hendrerit feugiat iaculis quis quam.
        
        Maecenas et nisi ante. Donec convallis eros ligula, eu tincidunt urna volutpat porttitor. Nunc vel consectetur felis, ac hendrerit nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque ex non tincidunt aliquet. Morbi vulputate risus quam, ac fermentum mi mollis id. Quisque eget fermentum nunc.</Text>
        </View>
        </View>])
      }).catch((error) => {
        console.error('Fetch featured error: ' + error);
      })
    })
    await Promise.all(pArray);
    this.setState({
      showLoading: false
    })
  }
  */
  

  setFeaturedCards(featuredJSON) {
    if(this.mounted === false) {
      return;
    }
  featuredJSON.map( tournamentInfo => {
      featuredCards.push([
      <View key={tournamentInfo.tournament_id}>
      <TouchableHighlight onPress={() => this.props.navigation.navigate("Tournament", {tournamentID: tournamentInfo.tournament_id})}>
      <Card containerStyle={styles.container}>
      <View>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{uri: tournamentInfo.ext_icon_url}}
      />
      <Text style={{alignContent: 'center', textAlign: 'center', color: '#000000', 
      fontSize: (this.headerFontSize * 20 / tournamentInfo.name.length)}}>{tournamentInfo.name}</Text>
      </View>
      </Card>
      </TouchableHighlight>
      </View>
      ])
    })
    this.setState({
      showLoading: false
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.getFeatured(this.setFeaturedCards);
  }

  componentWillMount() {
    this.mounted = false;
  }

  constructor(props){
    super(props);

    this.getFeatured = this.getFeatured.bind(this);
    this.setFeaturedCards = this.setFeaturedCards.bind(this);

    this.mounted = false;

    this.state = {
      showLoading: true,
    }

    this.headerFontSize= 21;
  }

  render() {
    return (
      <View>
      <Carousel sneak={30} pageStyle={ {borderRadius: 20}}>
      {this.state.showLoading ? loadingGIF : featuredCards}
      </Carousel>
      <Carousel sneak={30} pageStyle={ {borderRadius: 20}}>
      {this.state.showLoading ? loadingGIF : featuredCards}
      </Carousel>
      {/*
      <View style={{margin: 30}}>
      <Text>Etiam lacinia iaculis tincidunt. Nam varius, est non accumsan consectetur, ex orci vestibulum felis, non dictum est sapien vitae nulla. Phasellus nibh quam, consequat ac nisl ut, vulputate ornare tellus. Quisque euismod feugiat urna vitae tincidunt. Ut iaculis ornare lacus a posuere. Suspendisse potenti. Duis id accumsan diam. Nam ut lacus quis neque cursus sollicitudin eget fermentum nisl. Vestibulum non orci ac urna mattis pulvinar sit amet consequat ex. Curabitur non purus a dolor iaculis ullamcorper. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent mattis vel elit non consectetur.

      Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer et felis vitae lacus congue semper ac et diam. Aliquam erat volutpat. Aliquam pharetra eget leo eget pulvinar. Donec magna metus, eleifend vestibulum nisl nec, tincidunt tincidunt nulla. Vestibulum at rutrum velit, quis convallis nibh. Suspendisse at porta eros. Aenean blandit velit sed libero ullamcorper dictum. Fusce non mauris tellus. Etiam tincidunt lorem magna, eu tincidunt diam pretium eu. Sed volutpat tortor et ante hendrerit feugiat iaculis quis quam.
      
      Maecenas et nisi ante. Donec convallis eros ligula, eu tincidunt urna volutpat porttitor. Nunc vel consectetur felis, ac hendrerit nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque ex non tincidunt aliquet. Morbi vulputate risus quam, ac fermentum mi mollis id. Quisque eget fermentum nunc.</Text>
      </View>*/}
      </View>)

  }
}
