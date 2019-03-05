import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, Image, Alert } from 'react-native';
import { SearchBar, Card } from 'react-native-elements';


export class TournamentSearch extends React.Component {
    searchTournament(term) {
        fetch(global.server + '/tournaments' + (term !='' ? ('?name=' + term) : ''), {
            method: "GET",
            headers: this.httpGetHeaders
        })
        .then((response) => {
            if(response.status === 404 || response.status === 400) {
                Alert.alert("Alert", "(404 or 400) Should not be seing this.");
              } else if (response.status === 200) {
                response.json().then((respjson) => {
                  this.state.data = [];
                  respjson.map((tournamentInfo) => {
                      this.state.data.push({
                          key: tournamentInfo.tournament_id,
                          img_uri: (tournamentInfo.ext_icon_url != null ? tournamentInfo.ext_icon_url : ''),
                          title: tournamentInfo.name
                      });
                  })
                })
              }
        })
        .catch((error) => {
            console.error('Fetch featured error: ' + error);
        });
    }

    constructor(props){
        super(props);
    
        this.state = { 
          search: '',
          data: [
            {key: '1', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}]
        };

        this.searchTournament('');
    }

    httpGetHeaders = {};

    render() {
        return (
            <View>
            <SearchBar
                placeholder="Search"
                onChangeText={(text) => {
                    this.setState({search: text});
                    this.searchTournament(this.state.search);
                }}
                value={this.state.search}
                containerStyle={styles.searchContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
                placeholderTextColor="#b3002d"
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <FlatList
                data={this.state.data}
                renderItem={({item}) => 
                    <Card containerStyle={styles.cardContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Image
                            resizeMode="cover"
                            style={styles.image}
                            source={{uri: item.img_uri}}/>
                        <Text style={styles.headerText}>{item.title}</Text>                     
                    </View>
                    </Card>}
            />
            </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
    },
    searchInputContainer: {
        backgroundColor: 'transparent',
        borderRadius: 20
    },
    searchInput: {
        color: '#b3002d',
    },
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