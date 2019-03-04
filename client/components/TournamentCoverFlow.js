import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Carousel from "react-native-carousel-control";
import { Card} from 'react-native-elements'

const styles = StyleSheet.create({
  bigBlue: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 30,
  },
  centerText: {
    alignContent: 'center',
    textAlign: 'center',
    color: '#000000',
    fontSize: 21,
  },
  container: {
    height: 420,
  },
  image: {
    width: 270, 
    height: 270,
    marginTop: 10, 
    marginBottom: 10,
  }
});

const server = "https://127.0.0.1:5000";
let httpJsonHeaders = {};
let httpGetHeaders = {};
let featured = [
  {
    "banner_path": "tournaments/72577/banner.png", 
    "ends_at": 1559451600, 
    "events": [], 
    "icon_path": "tournaments/72577/icon.png", 
    "is_featured": true, 
    "name": "Smash'N'Splash 5", 
    "slug": "tournament/smash-n-splash-5", 
    "tournament_id": 72577
  }, 
  {
    "banner_path": "tournaments/96984/banner.png", 
    "ends_at": 1553482800, 
    "events": [
      225774, 
      225775, 
      237391, 
      237392
    ], 
    "icon_path": "tournaments/96984/icon.png", 
    "is_featured": true, 
    "name": "Full Bloom 5", 
    "slug": "tournament/full-bloom-5", 
    "tournament_id": 96984
  }, 
  {
    "banner_path": "tournaments/98906/banner.png", 
    "ends_at": 1552874400, 
    "events": [], 
    "icon_path": "tournaments/98906/icon.png", 
    "is_featured": true, 
    "name": "FINAL ROUND 2019", 
    "slug": "tournament/final-round-2019-1", 
    "tournament_id": 98906
  }, 
  {
    "banner_path": "tournaments/114457/banner.png", 
    "ends_at": 1564981200, 
    "events": [], 
    "icon_path": "tournaments/114457/icon.png", 
    "is_featured": true, 
    "name": "Evo 2019", 
    "slug": "tournament/evo-2019", 
    "tournament_id": 114457
  }, 
  {
    "banner_path": "tournaments/114599/banner.png", 
    "ends_at": 1563760800, 
    "events": [], 
    "icon_path": "tournaments/114599/icon.png", 
    "is_featured": true, 
    "name": "Defend The North 2019", 
    "slug": "tournament/defend-the-north-2019", 
    "tournament_id": 114599
  }, 
  {
    "banner_path": "tournaments/117653/banner.png", 
    "ends_at": 1555304400, 
    "events": [], 
    "icon_path": "tournaments/117653/icon.png", 
    "is_featured": true, 
    "name": "2GG: Prime Saga", 
    "slug": "tournament/2gg-prime-saga-1", 
    "tournament_id": 117653
  }, 
  {
    "banner_path": "tournaments/118817/banner.png", 
    "ends_at": 1557709200, 
    "events": [], 
    "icon_path": "tournaments/118817/icon.png", 
    "is_featured": true, 
    "name": "Texas Showdown 2019", 
    "slug": "tournament/texas-showdown-2019", 
    "tournament_id": 118817
  }, 
  {
    "banner_path": "tournaments/119238/banner.png", 
    "ends_at": 1556503200, 
    "events": [], 
    "icon_path": "tournaments/119238/icon.png", 
    "is_featured": true, 
    "name": "PACE 2019 - Speedrun Convention", 
    "slug": "tournament/pace-2019-speedrun-convention", 
    "tournament_id": 119238
  }, 
  {
    "banner_path": "tournaments/119868/banner.png", 
    "ends_at": 1555876800, 
    "events": [], 
    "icon_path": "tournaments/119868/icon.png", 
    "is_featured": true, 
    "name": "The MIXUP 2019", 
    "slug": "tournament/the-mixup-2019", 
    "tournament_id": 119868
  }, 
  {
    "banner_path": "tournaments/122950/banner.png", 
    "ends_at": 1558926000, 
    "events": [], 
    "icon_path": "tournaments/122950/icon.png", 
    "is_featured": true, 
    "name": "COMBO BREAKER 2019", 
    "slug": "tournament/combo-breaker-2019", 
    "tournament_id": 122950
  }, 
  {
    "banner_path": "tournaments/125595/banner.png", 
    "ends_at": 1558256400, 
    "events": [], 
    "icon_path": "tournaments/125595/icon.png", 
    "is_featured": true, 
    "name": "BAM11 Battle Arena Melbourne 11", 
    "slug": "tournament/bam11-battle-arena-melbourne-11", 
    "tournament_id": 125595
  }, 
  {
    "banner_path": "tournaments/128198/banner.png", 
    "ends_at": 1554094800, 
    "events": [], 
    "icon_path": "tournaments/128198/icon.png", 
    "is_featured": true, 
    "name": "NorCal Regionals 2019", 
    "slug": "tournament/norcal-regionals-2019", 
    "tournament_id": 128198
  }, 
  {
    "banner_path": "tournaments/128651/banner.png", 
    "ends_at": 1552284000, 
    "events": [], 
    "icon_path": "tournaments/128651/icon.png", 
    "is_featured": true, 
    "name": "Smash Ultimate Summit", 
    "slug": "tournament/smash-ultimate-summit", 
    "tournament_id": 128651
  }, 
  {
    "banner_path": "tournaments/130312/banner.png", 
    "ends_at": 1567360800, 
    "events": [], 
    "icon_path": "tournaments/130312/icon.png", 
    "is_featured": true, 
    "name": "Celtic Throwdown 2019", 
    "slug": "tournament/celtic-throwdown-2019", 
    "tournament_id": 130312
  }, 
  {
    "banner_path": "tournaments/132419/banner.png", 
    "ends_at": 1561950000, 
    "events": [], 
    "icon_path": "tournaments/132419/icon.png", 
    "is_featured": true, 
    "name": "CEO 2019 Fighting Game Championships", 
    "slug": "tournament/ceo-2019-fighting-game-championships", 
    "tournament_id": 132419
  }, 
  {
    "banner_path": "tournaments/132707/banner.png", 
    "ends_at": 1554670800, 
    "events": [], 
    "icon_path": "tournaments/132707/icon.png", 
    "is_featured": true, 
    "name": "Brussels Challenge Major Edition 2019", 
    "slug": "tournament/brussels-challenge-major-edition-2019", 
    "tournament_id": 132707
  }, 
  {
    "banner_path": null, 
    "ends_at": 1556514000, 
    "events": [], 
    "icon_path": "tournaments/134319/icon.png", 
    "is_featured": true, 
    "name": "Northwest Majors 11 - April 27th & 28th 2019", 
    "slug": "tournament/northwest-majors-11-april-27th-28th-2019", 
    "tournament_id": 134319
  }, 
  {
    "banner_path": "tournaments/138166/banner.png", 
    "ends_at": 1563159600, 
    "events": [], 
    "icon_path": "tournaments/138166/icon.png", 
    "is_featured": true, 
    "name": "TORYUKEN 2019 - Toronto's Major Fighting Game Tournament", 
    "slug": "tournament/toryuken-2019-toronto-s-major-fighting-game-tournament", 
    "tournament_id": 138166
  }, 
  {
    "banner_path": "tournaments/138517/banner.png", 
    "ends_at": 1555297200, 
    "events": [], 
    "icon_path": "tournaments/138517/icon.png", 
    "is_featured": true, 
    "name": "April Annihilation 2019", 
    "slug": "tournament/april-annihilation-2019", 
    "tournament_id": 138517
  }, 
  {
    "banner_path": "tournaments/138532/banner.png", 
    "ends_at": 1561348800, 
    "events": [], 
    "icon_path": "tournaments/138532/icon.png", 
    "is_featured": true, 
    "name": "The Fight 2019", 
    "slug": "tournament/the-fight-2019", 
    "tournament_id": 138532
  }
];

async function getFeatured() {
  return fetch(server + '/featured', {
      method: "GET",
      headers: httpGetHeaders
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //return responseJson.movies;
      console.log(responseJson);
    })
    .catch((error) => {
      console.error('Ruwaid error: ' + error);
    });
}

var featuredCards = featured.map(tournamentInfo => (
      <Card containerStyle={styles.container}>
      <View key={tournamentInfo.tournament_id}>
      <Text style={styles.centerText}>{tournamentInfo.name}</Text>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{ uri: 'https://images.smash.gg/images/' + tournamentInfo.icon_path}}
      />
      <Text>"Text goes here?"</Text>
      </View>
      </Card>
));

{/*backgroundColor: "#131862"*/}
export class TournamentCoverFlow extends React.Component {
  render() {
    return (
      <View>
      {<Carousel sneak={40} pageStyle={ {borderRadius: 20}}>{
      featured.map(tournamentInfo => (
        <Card containerStyle={styles.container}>
        <View key={tournamentInfo.tournament_id}>
        <Text style={styles.centerText}>{tournamentInfo.name}</Text>
        <Image
          resizeMode="cover"
          style={styles.image}
          source={{ uri: 'https://images.smash.gg/images/' + tournamentInfo.icon_path}}
        />
        <Text>"Text goes here?"</Text>
        </View>
        </Card>
        ))}
        </Carousel>
      }

      <Carousel sneak={40} pageStyle={ {borderRadius: 20}}>
      <Card containerStyle={styles.container}>
      <View key={1}>
      <Text style={styles.centerText}>Phantom 2019</Text>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{ uri: 'https://smashgg.imgix.net/images/tournament/111881/image-da5f435463588b3c6a4c048914bca3d2.png?auto=compress,format&w=280&h=280&fit=crop'}}
      />
      <Text>"The Smash and Splatoon scenes converge at Australia's first Ultimate major!"</Text>
      </View>
      </Card>

      <Card containerStyle={styles.container}>
      <View key={2}>
      <Text style={styles.centerText}>Battle of BC 3</Text>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{ uri: 'https://smashgg.imgix.net/images/tournament/121567/image-4e1a3e8c55b4faa0973bdfa35d36b0f4.png?auto=compress,format&w=280&h=280&fit=crop'}}
      />
      <Text>"The UBC Esports Association and EndGameTV are excited to announce the return of Battle of BC!"</Text>
      </View>      
      </Card>

      <Card containerStyle={styles.container}>
      <View key={3}>
      <Text style={styles.centerText}>Evo 2019</Text>
      <Image
        resizeMode="cover"
        style={styles.image}
        source={{ uri: 'https://smashgg.imgix.net/images/tournament/114457/image-7858e93b30976cbd4ea8af36ebbff736.png?auto=compress,format&w=280&h=280&fit=crop'}}
      />
      <Text>"The Evolution Championship Series (Evo for short) represents the largest and longest-running fighting game tournaments in the world. "</Text>
      </View>      
      </Card>
      
      </Carousel>

      <View style={{margin: 30}}>
        <Text>Etiam lacinia iaculis tincidunt. Nam varius, est non accumsan consectetur, ex orci vestibulum felis, non dictum est sapien vitae nulla. Phasellus nibh quam, consequat ac nisl ut, vulputate ornare tellus. Quisque euismod feugiat urna vitae tincidunt. Ut iaculis ornare lacus a posuere. Suspendisse potenti. Duis id accumsan diam. Nam ut lacus quis neque cursus sollicitudin eget fermentum nisl. Vestibulum non orci ac urna mattis pulvinar sit amet consequat ex. Curabitur non purus a dolor iaculis ullamcorper. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent mattis vel elit non consectetur.

        Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer et felis vitae lacus congue semper ac et diam. Aliquam erat volutpat. Aliquam pharetra eget leo eget pulvinar. Donec magna metus, eleifend vestibulum nisl nec, tincidunt tincidunt nulla. Vestibulum at rutrum velit, quis convallis nibh. Suspendisse at porta eros. Aenean blandit velit sed libero ullamcorper dictum. Fusce non mauris tellus. Etiam tincidunt lorem magna, eu tincidunt diam pretium eu. Sed volutpat tortor et ante hendrerit feugiat iaculis quis quam.
        
        Maecenas et nisi ante. Donec convallis eros ligula, eu tincidunt urna volutpat porttitor. Nunc vel consectetur felis, ac hendrerit nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque ex non tincidunt aliquet. Morbi vulputate risus quam, ac fermentum mi mollis id. Quisque eget fermentum nunc.</Text>
      </View>
      </View>
    );
  }
}
