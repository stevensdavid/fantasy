import React from 'react';
import { StyleSheet, View, ScrollView, ImageBackground, Text, Image, Alert, TouchableHighlight, Dimensions } from 'react-native';
import { Icon, Card } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';

export class EventView extends React.Component {

    constructor(props){
        super(props);

        this.state = { 
            loading: false,
            eventInfo: {},
            icon_uri: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
            eventID: null,
        };

        this.fetchEventInfo = this.fetchEventInfo.bind(this);
        this.fetchVideogameInfo = this.fetchVideogameInfo.bind(this);
        this.fetchTournamentInfo = this.fetchTournamentInfo.bind(this);
    }

    componentDidMount() {
        this.fetchEventInfo();
    }

    httpGetHeaders = {};

    fetchEventInfo() {
        this.setState({loading: true});
        fetch(global.server + "/events/" + this.props.eventID, {
            method: 'GET',
            headers: this.httpGetHeaders
        }).then((response) => {
            if(response.status === 404 || response.status === 400) {
            Alert.alert(
                'ERROR!',
                'EVENT ID OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!',
                [
                {text: 'OK', onPress: () => this.setState({loading: false})}
                ],
                { cancelable: false }
            )
            } else if(response.status === 200) {
                console.log(response);
                response.json().then((eventJSON) => {
                    this.fetchVideogameInfo(eventJSON.videogame).then((videogameInfo) => {
                        this.fetchTournamentInfo(eventJSON.tournament).then((tournamentInfo) => {
                            this.setState({
                                eventInfo: {
                                    name: eventJSON.name,
                                    numEntrants: eventJSON.num_entrants,
                                    entrants: eventJSON.entrants,
                                    fantasyLeagues: eventJSON.fantasy_leagues,
                                    placements: eventJSON.placements,
                                    slug: eventJSON.slug,
                                    startAt: eventJSON.start_at,
                                    tournamentID: tournamentInfo.tournament_id,
                                    videogameID: videogameInfo.videogame_id,
                                    tournamentName: tournamentInfo.name,
                                    videogameName: videogameInfo.name,
                                    icon_uri: (videogameInfo.ext_photo_url ? videogameInfo.ext_photo_url : 'https://cdn.cwsplatform.com/assets/no-photo-available.png'),
                                    banner_uri: (tournamentInfo.ext_banner_url != null ? tournamentInfo.ext_banner_url : 'https://www.mackspw.com/c.1179704/sca-dev-vinson/img/no_image_available.jpeg?resizeid=4&resizeh=1280&resizew=2560'),
                                },
                                loading: false,
                            });
                        }).catch((error) => {
                            console.error('GET tournament within event info error: ' + error);
                            this.setState({loading: false});
                        });
                    }).catch((error) => {
                        console.error('GET videogame within event info error: ' + error);
                        this.setState({loading: false});
                    });
                })
            }
        }).catch((error) => {
            console.error('GET event info error: ' + error);
            this.setState({loading: false});
        });
    }

    fetchVideogameInfo(videogameID) {
        return fetch(global.server + "/videogame/" + videogameID, {
            method: 'GET',
            headers: this.httpGetHeaders
        }).then((response) => {
            if(response.status === 404 || response.status === 400) {
            Alert.alert(
                'ERROR!',
                'VIDEOGAME ID OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!',
                [
                {text: 'OK', onPress: () => this.setState({loading: false})}
                ],
                { cancelable: false }
            )
            } else if(response.status === 200) {
                console.log(response);
                return response.json();
            }
        }).catch((error) => {
            console.error('GET tournament error: ' + error);
            this.setState({loading: false});
        });
    }

    fetchTournamentInfo(tournamentID) {
        return fetch(global.server + "/tournaments/" + tournamentID, {
            method: 'GET',
            headers: this.httpGetHeaders
        }).then((response) => {
            if(response.status === 404 || response.status === 400) {
            Alert.alert(
                'ERROR!',
                'TOURNAMENT ID OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!',
                [
                {text: 'OK', onPress: () => this.setState({loading: false})}
                ],
                { cancelable: false }
            )
            } else if(response.status === 200) {
                console.log(response);
                return response.json();
            }
        }).catch((error) => {
            console.error('GET tournament error: ' + error);
            this.setState({loading: false});
        });
    }

    render() {
        return (
            <View>
                <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <ImageBackground resizeMode="cover" style={styles.bannerImage} source={{uri: this.state.eventInfo.banner_uri}}>
                    <TouchableHighlight style={[styles.buttonContainer, styles.backButton]} onPress={() => this.props.clearViewEvent()}>
                        <Icon containerStyle={{alignSelf:'center', alignItems:'center'}} name='keyboard-arrow-left' type='material' color='#eff' size={58}/>
                    </TouchableHighlight>
                </ImageBackground>
                <View style={{borderBottomColor: 'silver', borderBottomWidth: 2, marginTop: 5, marginBottom: 5, marginLeft: 7, marginRight: 7}}/>
                <View style={styles.iconImageContainer}>
                    <Image resizeMode="cover" style={styles.iconImage} source={{uri: this.state.eventInfo.icon_uri}}/>
                    <Text style={styles.headerText}>{this.state.eventInfo.name}</Text>
                </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerText: {
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        marginLeft: 10,
        marginRight: 150,
        fontSize: 26,
        fontWeight: 'bold',
    },
    container: {
        backgroundColor: '#fff',
    },
    iconImage: {
        width: 120,
        height: 120,
        marginRight: 10,
        marginLeft: 4,
        borderWidth: 2,
    },
    bannerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width / 2, 
    },
    buttonContainer: {
        height: 50,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 7,
        marginTop: 5,
        borderRadius:30,
    },
    backButton: {
        backgroundColor: "#b3002d",
    },
    iconImageContainer: {  
        flexDirection: 'row',
    },
});