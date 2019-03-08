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
            public: false,
            draftSize: 5
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.inputs}
                        placeholder="League name"
                        keyboardType="default"
                        underlineColorAndroid='transparent'
                        onChangeText={(name) => this.setState({name})}
                    />
                </View>
            </View>
        )
    }
}