import { Text, View } from 'react-native'
import React from 'react'
import RootNavigator from './src/RootNavigator'

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <RootNavigator />
    </View>
  )
}
