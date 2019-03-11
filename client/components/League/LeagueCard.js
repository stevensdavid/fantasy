import React from 'react'
import { View, Image, Text, StyleSheet, TouchableHighlight } from 'react-native'
import { Card } from 'react-native-elements'
import { LeagueView } from './LeagueView.js'

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
    },
    text: {
        color: '#000000',
        alignContent: 'left',
        textAlign: 'center',

    }
});

export class LeagueCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.league;
        setTournament();
    }

    setTournament() {
        fetch(global.server + '/events/' + this.state.event, { method: 'GET' }).then(res => {
            return res.json();
        }).then(event => {
            return fetch(global.server + '/tournaments/' + event.tournament, { method: 'GET' });
        }).then(res => {
            return res.json();
        }).then(tournament => {
            this.setState({tournament: tournament})
        }).catch(err => {
            console.error('LeagueCard setTournament error: ' + err);
        })
    }

    render() {
        return (
            <View>
                <TouchableHighlight onPress={() => 1 + 1// TODO: switch to leagueview
                }>
                    <Card containerStyle={styles.card}>
                        <View>
                            <Image
                                resizeMode="cover"
                                source={{ uri: this.state.tournament.ext_icon_url }}
                            />
                            <Text style={styles.text}>{this.state.name}</Text>
                            <Text style={styles.text}>{this.state.tournament.name}</Text>
                        </View>
                    </Card>
                </TouchableHighlight>
            </View>
        )
    }
}