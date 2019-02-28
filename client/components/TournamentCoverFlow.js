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
{/*backgroundColor: "#131862"*/}
export class TournamentCoverFlow extends React.Component {
  render() {
    return (
      <View>
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
