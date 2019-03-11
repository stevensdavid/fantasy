import React from 'react';
import {View} from 'react-native'
import { ScrollableListContainer } from '../Container/ScrollableListContainer'

export class LeagueList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.setData();
    }

    setData() {
        console.log('LeagueList setting data: ' + this.props.leagues)
        for (league of this.props.leagues) {
            console.log(league)
            let event;
            fetch(global.server + '/events/' + league.event, { method: 'GET' }).then(res => {
                return res.json();
            }).then(event_obj => {
                event = event_obj;
                return fetch(global.server + '/tournaments/' + event.tournament, { method: 'GET' })
            }).then(res => {
                return res.json();
            }).then(tournament_obj => {
                this.state = this.state.data.concat([{
                    key: league.league_id,
                    title: league.name,
                    description: tournament_obj.name + ': ' + event.name,
                    img_url: tournament_obj.ext_icon_url
                }])
            }).catch(err => console.error(err));
        }
        console.log('LeagueList done setting data: ' + this.state.data);
    }

    render() {
        return (
            <View>
                <ScrollableListContainer data={this.state.data} onItemClick={key => { }} //style={null}
                />
            </View>
        );
    }
}