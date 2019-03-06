
import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, Image, Alert } from 'react-native';
import { SearchBar, Card } from 'react-native-elements';


export class TournamentView extends React.Component {
    constructor(props){
        super(props);

        this.state = { 
          search: '',
          data: []
        };
    }

    httpGetHeaders = {};

    render() {
        return (
            <Text>Tournament: {this.props.tournamentID}</Text>
        );
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
    }
});