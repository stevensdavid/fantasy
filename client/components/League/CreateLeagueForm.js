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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class CreateLeagueForm extends React.Component {
    static navigationOptions = {
        title: 'Create Fantasy League',
    };

    constructor(props) {
        super(props)
        this._isMounted = false;
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

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    createLeague(stateInfo) {
        if (!global.token) {
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
            if (!this._isMounted) return;
            if (res.status === 404 || res.status === 400) {
                Alert.alert("Alert", "Invalid input!");
                throw 'Invalid input';
            } else if (res.status === 200) {
                return res.json();
            } else if (res.status === 500) {
                throw 'Create league server error';
            }
        }).then(obj => {
            if (!this._isMounted) return;
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
            if (!this._isMounted) return;
            if (participant_res.status == 200) {
                this.props.navigation.goBack();
                this.props.navigation.navigate("Leagues", { newData: true, leagueID: this.leagueID, isSnake: this.state.isSnake });
            } else {
                throw ('Add league owner to league error');
            }
        }).catch(error => {
            console.error('Create league error: ' + error);
        });
    }

    render() {
        return (
            <KeyboardAwareScrollView>
                <View style={styles.container}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.textStyle}>League name:</Text>
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
                        <Text style={styles.textStyle}>Draft size:</Text>
                        <TextInput style={styles.inputs}
                            ref={input => (this.draftSize = input)}
                            defaultValue="5"
                            keyboardType="number-pad"
                            underlineColorAndroid='transparent'
                            onChangeText={(draftSize) => this.setState({ draftSize })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.textStyle}>Snake draft:</Text>
                        <Switch style={styles.switches}
                            value={this.state.isSnake}
                            onValueChange={(isSnake) => this.setState({ isSnake })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.textStyle}>Public:</Text>
                        <Switch style={styles.switches}
                            value={this.state.isPublic}
                            onValueChange={(isPublic) => this.setState({ isPublic })}
                        />
                    </View>

                    <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.createLeague(this.state)}>
                        <Text style={styles.loginText}>Create</Text>
                    </TouchableHighlight>
                </View>
            </KeyboardAwareScrollView >
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
    textStyle: {
        width: 100,
    },
    inputs: {
        height: 45,
        width: '100%',
        marginLeft: 16,
        borderBottomColor: '#FFFFFF',
    },
    switches: {
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
