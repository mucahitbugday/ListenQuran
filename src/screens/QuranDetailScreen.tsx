import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Appbar, Divider, Icon, IconButton, Menu, TouchableRipple, useTheme } from 'react-native-paper';
import surahList from '../data/surahList.json';

export default function QuranDetailScreen({ navigation, route }: any) {
    const { colors } = useTheme();
    const { number } = route.params;
    const [surahData, setSurahData] = useState<any>(surahList.find(s => s.number === number));


    const [isPlaying, setIsPlaying] = useState(false);
    const [playItemIndex, setPlayItemIndex] = useState<number | null>(null);
    const [playType, setPlayType] = useState<string>('');
    const [loadingItemIndex, setLoadingItemIndex] = useState<number | null>(null);
    const [sliderARFontValue, setSliderARFontValue] = useState(20);


    const handlePlayMP3 = async (type: string, number: number, index: number, isAuthoPlay?: boolean) => {

    };


    const [ayetMenuIndex, setAyetMenuIndex] = useState<number | null>(null);

    const renderItem = ({ item, index }: any) => {
        const isAyetMenuVisible = ayetMenuIndex === index;
        return (
            <View key={index} style={{ margin: 10, flexDirection: 'row', position: 'relative', borderRadius: 5 }}>
                <View style={{ backgroundColor: 'white', opacity: 0.3, position: 'absolute', width: '100%', height: '100%', borderRadius: 5 }}></View>
                <View style={{ flexDirection: 'column', borderColor: colors.primary, borderRadius: 5, width: '100%' }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: '100%', height: 25, paddingHorizontal: 10, backgroundColor: colors.primary, borderTopRightRadius: 5, borderTopLeftRadius: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 14 }}>{index + 1}. Ayet</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                            <TouchableRipple onPress={() => { handlePlayMP3('ayet', item.number, index) }} style={{ marginRight: 10 }}  >
                                <Icon source={isPlaying && playItemIndex === index ? 'pause' : 'play'} size={23} color='white' />
                            </TouchableRipple>


                            <Menu visible={isAyetMenuVisible} onDismiss={() => { setAyetMenuIndex(null); }} anchor={<TouchableRipple onPress={() => { setAyetMenuIndex(isAyetMenuVisible ? null : index); }}><Icon source={'dots-horizontal'} size={23} color='white' /></TouchableRipple>}>
                                <Menu.Item leadingIcon={'play'} title="Yer işaretlerine ekle" />
                                <Divider />
                                <Menu.Item leadingIcon={'play'} title="Şablon Oluştur ve paylaş" />
                            </Menu>
                        </View>
                    </View>

                    <View style={{ position: 'relative' }}>
                        <Text style={{ color: 'white', fontSize: sliderARFontValue }}>{item.text || ''}</Text>
                    </View>
                    {/* {(translateListValue || translateListValue !== "null") && isTranslateChecked && (
                        <>
                            <Divider />
                            <View style={{ padding: 10 }}>
                                <Text style={{ color: 'white', fontSize: sliderTRFontValue }}>{TercumeData?.data?.surahs[number - 1]?.ayahs[index]?.text || ''}</Text>
                            </View>
                        </>
                    )} */}
                </View>
            </View>
        );
    }


    return (
        <View style={{ flex: 1, backgroundColor: colors.secondary }}>

            <Appbar.Header style={{ backgroundColor: colors.secondary, height: 40 }}>
                <Appbar.BackAction color='white' onPress={() => navigation.goBack()} />
                <Appbar.Content color='white' title='Kuran-ı Mübin' />
                <Appbar.Action color='white' icon={'cog'} onPress={() => { navigation.navigate('QuranDetailSettingsScreen'); }} />
            </Appbar.Header>

            <View style={{ position: 'relative', margin: 10 }}>
                <View style={{ backgroundColor: 'white', opacity: 0.1, position: 'absolute', width: '100%', height: '100%', borderRadius: 5, }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, padding: 10 }}>
                    <View>
                        <Text style={{ color: 'white', fontSize: 40, }}>{surahData.data.englishName}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 18, }}>{surahData.data.revelationType == 'Meccan' ? 'Mekke' : 'Medine'}'de indi</Text>
                            <IconButton icon={isPlaying && playItemIndex == -1 && playType === 'sure' ? 'pause' : 'play'} iconColor='white' loading={loadingItemIndex === -1 && playType === 'sure'} onPress={() => { handlePlayMP3('sure', surahData.data.number, -1) }} />
                            <IconButton icon={isPlaying && playItemIndex == -1 && playType === 'meal' ? 'pause' : 'play'} iconColor='white' loading={loadingItemIndex === -1 && playType === 'meal'} onPress={() => { handlePlayMP3('meal', surahData.data.number, surahData.data.number) }} />
                        </View>
                    </View>
                    <View>
                        <Text style={{ color: 'white', fontSize: 18, }}>{surahData.data.number}. Sure</Text>
                        <Text style={{ color: 'white', fontSize: 18, }}>{surahData.data.numberOfAyahs} Ayet</Text>
                    </View>
                </View>
            </View>

            <FlatList renderItem={renderItem} keyExtractor={(item, index) => index.toString()} data={surahData.data.ayahs} />



        </View>
    )
}

const styles = StyleSheet.create({})