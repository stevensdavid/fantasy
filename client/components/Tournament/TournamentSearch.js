import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { ScrollableListContainer } from '../Container/ScrollableListContainer';


export class TournamentSearch extends React.Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this.searchAndSetTournaments = this.searchAndSetTournaments.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    
        this.state = { 
          search: '',
          data: [],
          tourID: null,
          loading: true,
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.searchAndSetTournaments('');
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    searchAndSetTournaments = (term) => {
        if (!this._isMounted) return;
        this.setState({loading: true});
        fetch(global.server + '/tournaments' + (term !='' ? ('?name=' + term) : ''), {
            method: "GET",
            headers: this.httpGetHeaders
        })
        .then((response) => {
            if (!this._isMounted) return;
            if(response.status != 200 && response.status != 204) {
                this.setState({loading: false});
                Alert.alert("Alert", "(Status is !200) Should not be seing this.");
              } else {
                response.json().then((respjson) => {
                  if (!this._isMounted) return;
                  this.setState({data: []});
                  const newData = [];
                  respjson.map((tournamentInfo) => {
                      const date = new Date(tournamentInfo.ends_at*1000);
                      newData.push({
                          key: '' + tournamentInfo.tournament_id,
                          img_uri: (tournamentInfo.ext_icon_url != null ? tournamentInfo.ext_icon_url : 'https://cdn.cwsplatform.com/assets/no-photo-available.png'),
                          title: tournamentInfo.name,
                          description: "Ends at: " + date.toDateString(),
                      });
                  })
                  this.setState({
                      data: newData,
                      loading: false,
                  })
                })
              }
        })
        .catch((error) => {
            if (!this._isMounted) return;
            this.setState({loading: true});
            console.error('Fetch featured error: ' + error);
        });
    }

    updateSearch = (term) => {
        this.setState({search:  term});
        this.searchAndSetTournaments(term);
    };


    httpGetHeaders = {};

    render() {
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
                <View style={{marginBottom: 180}}>
                <ScrollableListContainer 
                    data={this.state.data} 
                    onItemClick={(key) => this.props.navigation.push("Tournament", {tournamentID: key})}
                    loading={this.state.loading}>
                </ScrollableListContainer>
                </View>
            </View>)
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