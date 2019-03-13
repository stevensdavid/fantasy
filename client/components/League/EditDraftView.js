import React from 'react'
import {
    View,
    Text,
    Alert
} from 'react-native'
import { ScrollableListContainer } from '../Container/ScrollableListContainer'

export default class EditDraftView extends React.Component {
    constructor(props) {
        super(props)
        let league = this.props.navigation.getParam("league", null)
        this.state = {
            league: league,
            draft: league.fantasy_drafts.filter(x => x.user_id == global.userID),
            entrants: [],
            formattedDraft: [],
            formattedEntrants: []
        };
        console.log('State: ' + JSON.stringify(this.state))
        this.setFormattedLists = this.setFormattedLists.bind(this);
        this.getEntrants = this.getEntrants.bind(this);
    }

    componentDidMount() {
        if (this.state.draft) {
            this.getEntrants().then(newEntrants => {
                this.setState({ entrants: this.state.entrants.concat(newEntrants) });
                this.setFormattedLists();
            }).catch(err => console.error(err));
        }
    }

    setFormattedLists() {
        this.setState({
            formattedDraft: this.state.draft.map(x => {
                return {
                    key: x.player.player_id.toString(),
                    title: x.player.tag
                }
            })
        });
        this.setState({
            formattedEntrants: this.state.entrants.map(x => {
                return {
                    key: x.player.player_id.toString(),
                    title: x.player.tag,
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
                this.setState({ entrants: this.state.entrants.filter(x => x.player.player_id != newDraft.player_id) })
                this.setFormattedLists();
            }).catch(err => console.error(err));
    }

    render() {
        return (
            <View>
                <Text>Editing draft</Text>
                <Text>Drafted players</Text>
                <ScrollableListContainer
                    data={this.state.formattedDraft}
                />
                <Text>All players</Text>
                <ScrollableListContainer
                    data={this.state.formattedEntrants}
                    onItemClick={playerID => this.draftPlayer(playerID)}
                />
            </View>
        )
    }
}