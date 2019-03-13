import React from 'react';
import { ActivityIndicator, StyleSheet, View, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { Card, SearchBar } from 'react-native-elements';
import { HideAbleView } from '../View/HideAbleView';

/*Takes the following props:
    data: Array with objects each containing {key, img_uri(optional), title, description(optional)}
    onItemClick(key): Function which handles the key of a clicked item.(optional)
    style: Object holding React Native CSS(optional).
*/

export class ScrollableListContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: this.props.data,
            search: ''
        }

        this.dataHolder = this.props.data;

        this.searchFilterFunction = this.searchFilterFunction.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data != this.props.data) {
            this.setState({
                show: this.props.data
            });
            this.dataHolder = this.props.data
        }
    }

    searchFilterFunction(text) {
        this.setState({ search: text });
        const newData = this.dataHolder.filter(item => {
            const itemData = `${item.title.toUpperCase()}`;

            const textData = text.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });

        this.setState({ show: newData });
    }

    render() {
        return (
            (this.props.loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator animating={this.props.loading} size="large" color="#b3002d" />
                </View>
            ) : (
                    <View>
                        <HideAbleView hide={this.props.showSearchBar ? false || !(this.props.data.length > 0) : true}>
                            <SearchBar
                                placeholder="Search"
                                onChangeText={text => this.searchFilterFunction(text)}
                                containerStyle={styles.searchContainer}
                                value={this.state.search}
                                inputContainerStyle={styles.searchInputContainer}
                                inputStyle={styles.searchInput}
                                placeholderTextColor="#b3002d"
                            />
                        </HideAbleView>
                        <FlatList
                            data={this.state.show}
                            renderItem={({ item }) =>
                                <TouchableOpacity onPress={() => { this.props.onItemClick ? this.props.onItemClick(item.key) : {} }}>
                                    <Card containerStyle={styles.cardContainer}>
                                        <View style={{ flexDirection: 'row'}}>
                                            {item.img_uri ? (
                                                <Image
                                                    resizeMode="cover"
                                                    style={styles.image}
                                                    source={{ uri: item.img_uri }} />
                                            ) : (
                                                    <View></View>
                                                )}
                                            <View style={{justifyContent: 'center'}}>
                                                <Text style={styles.headerText}>{item.title}</Text>
                                                <Text style={styles.descriptionText}>{item.description ? item.description : ''}</Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>}
                        />
                    </View>
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
        borderRadius: 5,
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
    },
    searchContainer: {
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
    },
    searchInputContainer: {
        backgroundColor: 'transparent',
        borderRadius: 20
    },
    searchInput: {
        color: '#b3002d',
    },
});