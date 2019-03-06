
import React from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ImageBackground, Alert, TouchableHighlight, Dimensions } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';


export class TournamentView extends React.Component {
    constructor(props){
        super(props);

        this.state = { 
          search: '',
          data: [],
          loading: false,
          title: '',
          banner_uri: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
          icon_uri: 'https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif',
        };
    }
    
    httpGetHeaders = {};

    setTournamentInfo() {
        this.setState({loading: true});
        fetch(global.server + "/tournaments/" + this.props.tournamentID, {
            method: 'GET',
            headers: this.httpGetHeaders
        }).then((response) => {
            console.log(response);
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
            response.json().then((tournamentInfo) => {
                this.setState({
                    title: tournamentInfo.name,
                    banner_uri: (tournamentInfo.ext_banner_url != null ? tournamentInfo.ext_banner_url : 'http://www.indigo-press.com/wp-content/uploads/2014/01/no-banner.jpg'),
                    icon_uri: (tournamentInfo.ext_icon_url != null ? tournamentInfo.ext_icon_url : 'https://cdn.cwsplatform.com/assets/no-photo-available.png'),
                });
                this.setState({loading: false});
            })
            }
        }).catch((error) => {
            console.error('GET user error: ' + error);
            this.setState({loading: false});
        });
    }

    componentDidMount() {
        this.setTournamentInfo()
    }

    render() {
        return (
            <View>
                <Spinner visible={this.state.loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <ImageBackground resizeMode="cover" style={styles.bannerImage} source={{uri: this.state.banner_uri}}>
                    <TouchableHighlight style={[styles.buttonContainer, styles.backButton]} onPress={() => this.props.clearViewTournament()}>
                        <Icon containerStyle={{alignSelf:'center', alignItems:'center'}} name='keyboard-arrow-left' type='material' color='#eff' size={58}/>
                    </TouchableHighlight>
                </ImageBackground>
                <View style={{borderBottomColor: 'silver', borderBottomWidth: 2, marginTop: 5, marginBottom: 5, marginLeft: 7, marginRight: 7}}/>
                <View style={styles.iconImageContainer}>
                    <Image resizeMode="cover" style={styles.iconImage} source={{uri: this.state.icon_uri}}/>
                    <Text style={styles.headerText}>{this.state.title}</Text>
                </View>
                <View style={styles.textView}>
                <Text>Etiam lacinia iaculis tincidunt. Nam varius, est non accumsan consectetur, ex orci vestibulum felis, non dictum est sapien vitae nulla. Phasellus nibh quam, consequat ac nisl ut, vulputate ornare tellus. Quisque euismod feugiat urna vitae tincidunt. Ut iaculis ornare lacus a posuere. Suspendisse potenti. Duis id accumsan diam. Nam ut lacus quis neque cursus sollicitudin eget fermentum nisl. Vestibulum non orci ac urna mattis pulvinar sit amet consequat ex. Curabitur non purus a dolor iaculis ullamcorper. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent mattis vel elit non consectetur.

                Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer et felis vitae lacus congue semper ac et diam. Aliquam erat volutpat. Aliquam pharetra eget leo eget pulvinar. Donec magna metus, eleifend vestibulum nisl nec, tincidunt tincidunt nulla. Vestibulum at rutrum velit, quis convallis nibh. Suspendisse at porta eros. Aenean blandit velit sed libero ullamcorper dictum. Fusce non mauris tellus. Etiam tincidunt lorem magna, eu tincidunt diam pretium eu. Sed volutpat tortor et ante hendrerit feugiat iaculis quis quam.
        
                Maecenas et nisi ante. Donec convallis eros ligula, eu tincidunt urna volutpat porttitor. Nunc vel consectetur felis, ac hendrerit nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque ex non tincidunt aliquet. Morbi vulputate risus quam, ac fermentum mi mollis id. Quisque eget fermentum nunc.
                </Text>
                </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    bannerImage: {
        height: Dimensions.get('window').width / 2, 
    },
    iconImage: {
        width: 120,
        height: 120,
        marginRight: 10,
        marginLeft: 4,
        borderWidth: 2,
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
        marginRight: 70,
        fontSize: 21,
        fontWeight: 'bold',
    },
    textView: {
        margin: 10,
    }
});