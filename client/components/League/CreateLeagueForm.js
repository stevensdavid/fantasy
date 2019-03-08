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

export class CreateLeagueForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            eventId: props.eventId,
            isSnake: false,
            name: '',
            isPublic: false,
            draftSize: 5
        }
        console.log(this.state)
    }

    createLeague(stateInfo) {
        fetch(global.server + '/leagues', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': 'bearer '+global.token},
            body: JSON.stringify({
                eventId: stateInfo.eventId,
                isSnake: stateInfo.isSnake,
                name: stateInfo.name,
                public: stateInfo.isPublic,
                draftSize: stateInfo.draftSize,
                ownerId: global.userID
            })
        }).then((res) => {
            console.log(res);
            if(res.status === 404 || res.status === 400){
                Alert.alert("Alert", "Invalid input!");
                return;
            } else if (res.status === 200){
                // Switch screen
                Alert.alert("Success!")
            } else if (res.status === 500){
                console.error('Create league server error, state: ' + this.state)
            }
        }).catch((error) => {
            console.error('Create league error: ' + error)
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text>League name</Text>
                    <TextInput style={styles.inputs}
                        placeholder="Press to type..."
                        keyboardType="default"
                        underlineColorAndroid='transparent'
                        onChangeText={(name) => this.setState({ name })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Draft size</Text>
                    <TextInput style={styles.inputs}
                        defaultValue="5"
                        keyboardType="numeric"
                        underlineColorAndroid='transparent'
                        onChangeText={(draftSize) => this.setState({ draftSize })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Snake draft</Text>
                    <Switch style={styles.inputs}
                        onValueChange={(isSnake) => this.setState({ isSnake })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Public</Text>
                    <Switch style={styles.inputs}
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
