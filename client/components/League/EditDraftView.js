import React from 'react'
import {
    View,
    Text,
    Alert,
    ScrollView,
    StyleSheet
} from 'react-native'
import { ScrollableListContainer } from '../Container/ScrollableListContainer'

export default class EditDraftView extends React.Component {
    static navigationOptions = {
        title: "Edit draft"
    };

    constructor(props) {
        super(props)
        let league = this.props.navigation.getParam("league", null)
        this.state = {
            league: league,
            draft: league.fantasy_drafts.filter(x => x.user_id == global.userID),
            entrants: [],
            formattedDraft: [],
            formattedEntrants: [],
            loading: true
        };
        console.log('State: ' + JSON.stringify(this.state))
        this.setFormattedLists = this.setFormattedLists.bind(this);
        this.getEntrants = this.getEntrants.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
    }

    componentDidMount() {
        if (this.state.draft) {
            this.getEntrants().then(newEntrants => {
                this.setState({ entrants: this.state.entrants.concat(newEntrants) });
                this.setFormattedLists();
                this.setState({loading: false});
            }).catch(err => console.error(err));
        }
    }

    setFormattedLists() {
        this.setState({
            formattedDraft: this.state.draft.map(x => {
                return {
                    key: x.player.player_id.toString(),
                    title: x.player.tag,
                    img_uri: x.player.ext_photo_url ? x.player.ext_photo_url : "https://cdn.cwsplatform.com/assets/no-photo-available.png"
                }
            })
        });
        let draftedPlayers = this.state.draft.reduce((newObj, x) => Object.assign(newObj, { [x.player.player_id]: x.player }), {});
        this.setState({
            formattedEntrants: this.state.entrants.filter(
                x => !(x.player.player_id in draftedPlayers)
            ).map(x => {
                return {
                    key: x.player.player_id.toString(),
                    title: x.player.tag,
                    img_uri: x.player.ext_photo_url ? x.player.ext_photo_url : "https://cdn.cwsplatform.com/assets/no-photo-available.png",
                    description: 'Seed: ' + x.player.seed
                }
            })
        })
    }

    async getEntrants() {
        let res = await fetch(global.server + '/entrants/' + this.state.league.event.event_id)
        return await res.json();
    }

    draftPlayer(playerID) {
        if (this.state.draft.length >= this.state.league.draft_size) {
            Alert.alert('Your draft is full, please remove a player.');
            return;
        }
        fetch(global.server + '/drafts/' + this.state.league.league_id + '/' + global.userID,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + global.token },
                body: JSON.stringify({
                    playerId: playerID
                })
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw (res.body)
                }
            }).then(newDraft => {
                this.setState({ draft: this.state.draft.concat(newDraft) });
                this.setFormattedLists();
            }).catch(err => console.error(err));
    }

    removePlayer(playerID) {
        fetch(global.server + '/drafts/' + this.state.league.league_id + '/' + global.userID,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + global.token },
                body: JSON.stringify({
                    playerId: playerID
                })
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw (res.body)
                }
            }).then(newDraft => {
                this.setState({ draft: this.state.draft.filter(x => x.player.player_id != newDraft.player_id) });
                this.setFormattedLists();
            }).catch(err => console.error(err));
    }

    render() {
        return (
            <View>
                <ScrollView>
                    <Text style={styles.headerText}>Drafted players</Text>
                    <ScrollableListContainer
                        showSearchBar={true}
                        data={this.state.formattedDraft}
                        onItemClick={playerID => this.removePlayer(playerID)}
                        loading={this.state.loading}
                    />
                    <View style={{borderBottomColor: 'silver', borderBottomWidth: 2, marginTop: 5, marginBottom: 5, marginLeft: 7, marginRight: 7}}/>
                    <Text style={styles.headerText}>All players</Text>
                    <ScrollableListContainer
                        showSearchBar={true}
                        data={this.state.formattedEntrants}
                        onItemClick={playerID => this.draftPlayer(playerID)}
                        loading={this.state.loading}
                    />
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: 32,
        fontWeight: "bold",
        alignSelf:"center"
    }
});