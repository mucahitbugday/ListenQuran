import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Appbar, Snackbar, TouchableRipple, useTheme } from 'react-native-paper'
import surah from '../data/surahList.json';



export default function QuranSurahListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [visibleSnackbar, setVisibleSnackbar] = useState<boolean>(false);
  const [visibleSnackbarMessage, setVisibleSnackbarMessage] = useState<string>('');

  const renderItem = ({ item, index }: any) => (
    <TouchableRipple onPress={() => { navigation.navigate('QuranDetailScreen', { number: item.number }); }}>
      <View key={index} style={{ margin: 10, flexDirection: 'row', position: 'relative' }}>
        <View style={{ backgroundColor: 'white', opacity: 0.3, position: 'absolute', width: '100%', height: '100%', borderRadius: 5, }}></View>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 25, height: 50, backgroundColor: colors.primary, marginLeft: 15, marginBottom: 10, justifyContent: 'center', alignItems: 'center', borderBottomRightRadius: 8, borderBottomLeftRadius: 8 }}>
              <Text style={{ color: 'white', fontSize: 13 }}>{item.number}</Text>
            </View>
            <View style={{ marginLeft: 15, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Text style={{ color: 'white', fontSize: 15, }}>{item.englishName}</Text>
              <Text style={{ color: 'white', fontSize: 12, }}>{item.numberOfAyahs} Ayet</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginRight: 15 }}>
            <Text style={{ color: 'white', fontSize: 18, }}>{item.name}</Text>
          </View>

        </View>
      </View>
    </TouchableRipple>
  );


  return (
    <View style={{ flex: 1, backgroundColor: colors.secondary }}>
      <Appbar.Header style={{ backgroundColor: colors.primary, height: 50 }} >
        <Appbar.Content title="Surah List" color={colors.onPrimary} />
        <Appbar.Action icon="magnify" onPress={() => { }} color={colors.onPrimary} />
      </Appbar.Header>
      <FlatList renderItem={renderItem} keyExtractor={(item, index) => index.toString()} data={surah} />
      <Snackbar visible={visibleSnackbar} onDismiss={() => { setVisibleSnackbar(true) }}    >
        <Text>{visibleSnackbarMessage}</Text>
      </Snackbar>
    </View>
  )
} 