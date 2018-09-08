import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';

import Map from './src/Map';

export default class App extends Component<Props> {
  render() {
    console.disableYellowBox = true;

    return (
      <Map/>
    );
  }
}
