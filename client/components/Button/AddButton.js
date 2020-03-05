import React from 'react';
import { StyleSheet, TouchableHighlight, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { HideAbleView } from '../View/HideAbleView';

export class AddButton extends React.Component {
    render() {
        const item = (this.props.text ? <Text style={this.props.textStyle}>{this.props.text}</Text> : <Icon 
            containerStyle={{ alignSelf: "center", alignItems: "center" }}
            name= {this.props.buttonName ? this.props.buttonName : "add"}
            type="material"
            color="#eff"
            size={this.props.iconSize ? this.props.iconSize : 32} />)


        return (
            <HideAbleView style={this.props.containerStyle} hide={this.props.hide ? this.props.hide : false}>
                <TouchableHighlight
                    {...this.props}
                    style={[
                        styles.buttonContainer,
                        styles.addButton,
                        this.props.buttonStyle
                    ]}
                    onPress={() => this.props.onPress()}>
                {item}
                </TouchableHighlight>
            </HideAbleView>);
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        minHeight: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        minWidth: 50,
        borderRadius: 50
    },
    addButton: {
        backgroundColor: "#b3002d"
    },
});
