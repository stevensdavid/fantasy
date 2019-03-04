import React from 'react';
import {
  Platform
} from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaguesScreen from '../screens/LeaguesScreen';

//TODO: Remove this.
import LinksScreen from '../screens/LinksScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ?
      `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'
    }
    />
  ),
};

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Links',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ? 'ios-link' : 'md-link'
    }
    />
  ),
};

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ? 'ios-person' : 'md-person'
    }
    />
  ),
};

const LeaguesStack = createStackNavigator({
  Leagues: LeaguesScreen,
});

LeaguesStack.navigationOptions = {
  tabBarLabel: 'Leagues',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ?
      `ios-list${focused ? '-box' : ''}` : 'md-list'
    }
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  ProfileStack,
  LeaguesStack,
}, {
  tabBarOptions: {
    labelStyle: {
      fontSize: 12,
      color: '#fff',
    },
    style: {
      backgroundColor: '#800020',
    },
  }
});