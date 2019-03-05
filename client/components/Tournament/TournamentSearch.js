import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, Image } from 'react-native';
import { SearchBar, Card } from 'react-native-elements';


export class TournamentSearch extends React.Component {
    constructor(props){
        super(props);
    
        this.state = { 
          search: '',
          data: [
            {key: '1', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D 3D 3D 3D 3D 3D 3D 3D 3D'}, 
            {key: '2', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '3', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '4', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '5', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '6', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '7', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '8', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '9', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '10', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '11', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '12', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '13', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '14', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '15', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '16', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '17', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '18', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '19', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '20', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '21', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '22', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}, 
            {key: '23', img_uri: 'https://smashgg.imgix.net/images/tournament/110416/image-face35c5085dd11074f02063bb8d8d58.png', title:'The Big Deal: 3D'}]
        };     
    }

    render() {

        return (
            <View>
            <SearchBar
                placeholder="Search"
                onChangeText={(text) => this.setState({search: text})}
                value={this.state.search}
                containerStyle={styles.searchContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInput}
                placeholderTextColor="#b3002d"
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <FlatList
                data={this.state.data}
                renderItem={({item}) => 
                    <Card containerStyle={styles.cardContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Image
                            resizeMode="cover"
                            style={styles.image}
                            source={{uri: item.img_uri}}/>                       
                        <Text style={styles.headerText}>{item.title}</Text>
                    </View>
                    </Card>}
            />
            </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
    container: {
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingTop: 0,
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
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        marginRight: 70,
        fontSize: 21,
        fontWeight: 'bold',
      }
});