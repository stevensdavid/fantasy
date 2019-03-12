import React from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { HideAbleView } from '../View/HideAbleView';

export class AddButton extends React.Component {
    render() {
        return (
            <HideAbleView style={this.props.containerStyle} hide={this.props.hide ? this.props.hide : false}>
                <TouchableHighlight
                    {...this.props}
                    style={[
                        styles.buttonContainer,
                        styles.addButton,
                        this.props.buttonStyle
                    ]}
                    onPress={() => this.props.navigation.navigate("Search")}
                >
                    <Icon
                        containerStyle={{
                            alignSelf: "center",
                            alignItems: "center"
                        }}
                        name="add"
                        type="material"
                        color="#eff"
                        size={32}
                    />
                </TouchableHighlight>
            </HideAbleView>);
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        marginRight: 27,
        width: 50,
        borderRadius: 50
    },
    addButton: {
        backgroundColor: "#b3002d"
    },
});
