import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, Image, Alert, TouchableHighlight } from 'react-native';
import { SearchBar, Card } from 'react-native-elements';
import { TournamentView } from '../Tournament/TournamentView';
import { ScrollableListContainer } from '../Container/ScrollableListContainer';


export class TournamentSearch extends React.Component {
    searchAndSetTournaments = (term) => {
        fetch(global.server + '/tournaments' + (term !='' ? ('?name=' + term) : ''), {
            method: "GET",
            headers: this.httpGetHeaders
        })
        .then((response) => {
            if(response.status === 404 || response.status === 400) {
                Alert.alert("Alert", "(404 or 400) Should not be seing this.");
              } else if (response.status === 200) {
                response.json().then((respjson) => {
                  this.setState({data: []});
                  const newData = [];
                  respjson.map((tournamentInfo) => {
                      newData.push({
                          key: '' + tournamentInfo.tournament_id,
                          img_uri: (tournamentInfo.ext_icon_url != null ? tournamentInfo.ext_icon_url : 'https://cdn.cwsplatform.com/assets/no-photo-available.png'),
                          text: tournamentInfo.name
                      });
                  })
                  this.setState({
                      data: newData
                  })
                })
              }
        })
        .catch((error) => {
            console.error('Fetch featured error: ' + error);
        });
    }

    updateSearch = (term) => {
        this.setState({search:  term});
        this.searchAndSetTournaments(term);
    };

    componentDidMount() {
        this.searchAndSetTournaments('');
    }

    componentWillUnmount () {
        this.componentDidMount.remove()
    }

    viewTournament(key) {
        this.setState({
            tourID: key,
            viewTournament: true,
        });
    }

    clearViewTournament() {
        this.setState({
          viewingTournament: false,
          tourID: null,
        });
      }

    constructor(props){
        super(props);

        this.searchAndSetTournaments = this.searchAndSetTournaments.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.clearViewTournament = this.clearViewTournament.bind(this);
        this.viewTournament = this.viewTournament.bind(this);
    
        this.state = { 
          search: '',
          data: [],
          viewingTournament: false,
          tourID: null,
        };
    }

    httpGetHeaders = {};

    render() {
        if(!this.state.viewingTournament) {
        return(
        <View>
            <SearchBar
                placeholder="Search"
                onChangeText={this.updateSearch}
                value={this.state.search}
                containerStyle={styles.searchContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
                placeholderTextColor="#b3002d"
            />
            <ScrollableListContainer 
                data={this.state.data} 
                onItemClick={(key) => this.viewTournament(key)}>
            </ScrollableListContainer>
        </View>)
        } else {
            return <TournamentView clearViewTournament={this.clearViewTournament} tournamentID={this.state.tourID}></TournamentView>
        }
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