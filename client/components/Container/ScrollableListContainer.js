import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, Image, Alert, TouchableHighlight } from 'react-native';
import { SearchBar, Card } from 'react-native-elements';
import { TournamentView } from '../Tournament/TournamentView';

/*Takes the following props:
    data: array with objects each containing {key, img_url, text}
    onItemClick(key): function which handles the key of a clicked item.

*/

export class TournamentSearch extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <FlatList
            data={this.props.data}
            renderItem={({item}) => 
                <TouchableHighlight onPress={() => this.props.onItemClick(item.key)}>
                <Card containerStyle={styles.cardContainer}>
                <View style={{flexDirection: 'row'}}>
                    <Image
                        resizeMode="cover"
                        style={styles.image}
                        source={{uri: item.img_uri}}/>
                    <Text style={styles.headerText}>{item.text}</Text>                     
                </View>
                </Card>
                </TouchableHighlight>}
        />
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingTop: 0,
    },
    cardContainer: {
        height: 120,
        borderRadius: 10,
    },
    image: {
        width: 90, 
        height: 90,
    },
    headerText: {
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        marginLeft: 10,
        marginRight: 70,
        fontSize: 21,
        fontWeight: 'bold',
      }
});