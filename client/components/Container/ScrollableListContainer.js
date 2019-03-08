import React from 'react';
import { ActivityIndicator, StyleSheet, View, ScrollView, FlatList, Text, Image, Alert, TouchableHighlight } from 'react-native';
import { Card } from 'react-native-elements';

/*Takes the following props:
    data: Array with objects each containing {key, img_url(optional), title, description(optional)}
    onItemClick(key): Function which handles the key of a clicked item.
    style: Object holding React Native CSS(optional).
*/

export class ScrollableListContainer extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
        (this.props.loading? (
            <ActivityIndicator animating={this.props.loading} size="large" color="#b3002d" />
        ): (
        <ScrollView style={styles.container} contentContainerStyle={this.props.style}>
        <FlatList
            data={this.props.data}
            renderItem={({item}) => 
                <TouchableHighlight onPress={() => this.props.onItemClick(item.key)}>
                <Card containerStyle={styles.cardContainer}>
                <View style={{flexDirection: 'row'}}>
                    {item.img_uri ? (
                        <Image
                        resizeMode="cover"
                        style={styles.image}
                        source={{uri: item.img_uri}}/>
                    ) : (
                        <View></View>
                    )}
                    <View>
                    <Text style={styles.headerText}>{item.title}</Text>
                    <Text style={styles.descriptionText}>{item.description ? item.description : ''}</Text>
                    </View>                    
                </View>
                </Card>
                </TouchableHighlight>}
        />
        </ScrollView>
        )))
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    cardContainer: {
        height: 120,
        borderRadius: 10,
    },
    image: {
        width: 90, 
        height: 90,
    },
    headerText: {
        marginLeft: 10,
        marginRight: 70,
        fontSize: 21,
        fontWeight: 'bold',
    },
    descriptionText: {
        marginLeft: 10,
        marginRight: 70,
        fontSize: 12,
        fontWeight: 'bold',
    }
});