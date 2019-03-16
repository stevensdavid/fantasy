import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Switch,
    Button,
    TouchableHighlight,
    Image,
    Alert,
    Platform
} from 'react-native';

export default class CreateLeagueForm extends React.Component {
    static navigationOptions = {
        title: 'Create Fantasy League',
    };

    constructor(props) {
        super(props)
        this.state = {
            eventId: this.props.navigation.getParam("eventId", -1),
            isSnake: false,
            name: '',
            isPublic: false,
            draftSize: 5
        }
        console.log(this.state)

        this.createLeague = this.createLeague.bind(this)

        this.leagueID = null
    }

    createLeague(stateInfo) {
        if(!global.token) {
            Alert.alert("Alert", "Please log in before creating a league");
            this.props.navigation.goBack();
            return;
        }
        fetch(global.server + '/leagues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + global.token },
            body: JSON.stringify({
                eventId: stateInfo.eventId,
                isSnake: stateInfo.isSnake,
                name: stateInfo.name,
                public: stateInfo.isPublic,
                draftSize: stateInfo.draftSize,
                ownerId: global.userID
            })
        }).then(res => {
            if (res.status === 404 || res.status === 400) {
                Alert.alert("Alert", "Invalid input!");
                throw 'Invalid input';
            } else if (res.status === 200) {
                return res.json();
            } else if (res.status === 500) {
                throw 'Create league server error';
            }
        }).then(obj => {
            this.leagueID = obj.league_id
            return fetch(global.server + '/fantasy_participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + global.token },
                body: JSON.stringify({
                    userId: global.userID,
                    leagueId: obj.league_id
                })
            });
        }).then(participant_res => {
            if (participant_res.status == 200) {
                this.props.navigation.goBack();
                this.props.navigation.navigate("Leagues", {newData: true, leagueID: this.leagueID, isSnake: this.state.isSnake});
            } else {
                throw ('Add league owner to league error');
            }
        }).catch(error => {
            console.error('Create league error: ' + error);
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text>League name</Text>
                    <TextInput style={styles.inputs}
                    ref={input => (this.leagueName = input)}
            onSubmitEditing={() => this.draftSize.focus()}
                        placeholder="Press to type..."
                        keyboardType="default"
                        underlineColorAndroid='transparent'
                        onChangeText={(name) => this.setState({ name })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Draft size</Text>
                    <TextInput style={styles.inputs}
                    ref={input => (this.draftSize = input)}
                        defaultValue="5"
                        keyboardType="number-pad"
                        underlineColorAndroid='transparent'
                        onChangeText={(draftSize) => this.setState({ draftSize })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Snake draft</Text>
                    <Switch style={styles.inputs}
                        value={this.state.isSnake}
                        onValueChange={(isSnake) => this.setState({ isSnake })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Public</Text>
                    <Switch style={styles.inputs}
                        value={this.state.isPublic}
                        onValueChange={(isPublic) => this.setState({ isPublic })}
                    />
                </View>

                <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.createLeague(this.state)}>
                    <Text style={styles.loginText}>Create</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        width: 250,
        height: 45,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    spinnerTextStyle: {
        color: '#FFF',
    },
    inputs: {
        height: 45,
        marginLeft: 16,
        borderBottomColor: '#FFFFFF',
    },
    inputIcon: {
        width: 30,
        height: 30,
        marginLeft: 15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
    },
    iconContainer: {
        height: 72,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
    },
    loginButton: {
        backgroundColor: "#b3002d",
    },
    loginText: {
        color: 'white',
    }
});
