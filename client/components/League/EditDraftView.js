import React from 'react'
import {
    View,
    Text
} from 'react-native'
import { ScrollableListContainer } from '../Container/ScrollableListContainer'

export default class EditDraftView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            league: this.props.league
        };
    }

    render() {
        return (
            <View>
                <Text>Editing draft</Text>
            </View>
        )
    }
}