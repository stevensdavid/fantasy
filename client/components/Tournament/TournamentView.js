
import React from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ImageBackground, Alert, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { ScrollableListContainer } from '../Container/ScrollableListContainer';
import { HideAbleView } from '../View/HideAbleView';


export default class TournamentView extends React.Component {
    static navigationOptions = {
        title: 'Tournament',
    };
    
    constructor(props){
        super(props);

        this._isMounted = false;
        this.state = { 
          search: '',
          data: [],
          loading: true,
          title: '',
          banner_uri: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
          icon_uri: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
          eventData: null,
          loadingEvents: true,
        };
        
        this.tournamentID =  this.props.navigation.getParam("tournamentID", -1);
    }
    
    componentDidMount() {
        this._isMounted = true;
        this.setTournamentInfo();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    httpGetHeaders = {};
    httpGetHeaders2 = {};
    
    setTournamentInfo() {
        if (!this._isMounted) return;
        this.setState({loading: true});
        fetch(global.server + "/tournaments/" + this.tournamentID, {
            method: 'GET',
            headers: this.httpGetHeaders
        }).then((response) => {
            if (!this._isMounted) return;
            if(response.status != 200 && response.status != 204) {
            Alert.alert(
                'ERROR!',
                'TOURNAMENT ID OR PAGE NOT FOUND, SHOULD NOT BE SEING THIS!',
                [
                {text: 'OK', onPress: () => this.setState({loading: false})}
                ],
                { cancelable: false }
            )
            } else {
            response.json().then((tournamentInfo) => {
                if (!this._isMounted) return;
                this.setState({
                    title: tournamentInfo.name,
                    banner_uri: (tournamentInfo.ext_banner_url != null ? tournamentInfo.ext_banner_url : 'https://www.mackspw.com/c.1179704/sca-dev-vinson/img/no_image_available.jpeg?resizeid=4&resizeh=1280&resizew=2560'),
                    icon_uri: (tournamentInfo.ext_icon_url != null ? tournamentInfo.ext_icon_url : 'https://cdn.cwsplatform.com/assets/no-photo-available.png'),
                    eventData: tournamentInfo.events.map(e => {return {key:e.event_id.toString(), img_uri:e.videogame.ext_photo_url, title:e.name, description: (e.videogame.name + '\nStarts at: ' + new Date(e.start_at*1000).toDateString())}}),
                    loading: false,
                    loadingEvents: false,
                });
            })
            }
        }).catch((error) => {
            console.error('GET tournament info error: ' + error);
            if (!this._isMounted) return;
            this.setState({loading: false});
        });
    }

    render() {
        return (
            <View>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <ImageBackground resizeMode="cover" style={styles.bannerImage} source={{uri: this.state.banner_uri}} />
                <View style={{borderBottomColor: 'silver', borderBottomWidth: 2, marginTop: 5, marginBottom: 5, marginLeft: 7, marginRight: 7}}/>
                <View style={styles.iconImageContainer}>
                    <Image resizeMode="cover" style={styles.iconImage} source={{uri: this.state.icon_uri}}/>
                    <Text style={styles.headerText}>{this.state.title}</Text>
                </View>
                <HideAbleView hide={!this.state.eventData}>
                <Text style={{fontSize: 40, alignSelf:'center'}}>Events</Text>
                <ScrollableListContainer 
                data={this.state.eventData} 
                onItemClick={(key) => this.props.navigation.navigate("Event", {eventID: key, tournamentName: this.state.title, tournamentBanner: this.state.banner_uri})}
                loading={this.state.loadingEvents}
                showSearchBar={true}/>
                </HideAbleView>
                </ScrollView>
            </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    bannerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width / 2, 
    },
    iconImage: {
        width: 120,
        height: 120,
        marginRight: 10,
        marginLeft: 4,
        borderWidth: 2,
    },
    scrollContainerStyling: {
        height: 320,
        borderWidth: 2, 
        margin: 4
    },
    iconImageContainer: {  
        flexDirection: 'row',
    },
    iconCard: {
        height: 130,
        width: 130,
        margin: 2,
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
    headerText: {
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        marginLeft: 10,
        marginRight: 150,
        fontSize: 26,
        fontWeight: 'bold',
    },
    textView: {
        margin: 10,
    }
});