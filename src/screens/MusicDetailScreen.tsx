import { StyleSheet, View, TouchableWithoutFeedback, Dimensions } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { usePlayer } from '../context/PlayerContext'
import { Appbar, Button, Card, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper'
import { StorageService } from '../utils/storage'

export default function MusicDetailScreen() {
    const route = useRoute<any>()
    const navigation = useNavigation()
    const { currentTrack, isPlaying, progress, togglePlay, seekTo, skipToNext, skipToPrevious, queue, isRepeat, setRepeat, getSurahInfo } = usePlayer()
    const theme = useTheme()
    const [isFavorite, setIsFavorite] = useState(false)
    const title = useMemo(() => currentTrack?.title || route.params?.track?.title || 'Parça', [currentTrack, route.params])
    
    const surahNumber = useMemo(() => {
        const match = title.match(/^(\d+)\./)
        return match ? parseInt(match[1]) : null
    }, [title])
    
    const surahInfo = useMemo(() => {
        return surahNumber ? getSurahInfo(surahNumber) : null
    }, [surahNumber, getSurahInfo])

    const [playCount, setPlayCount] = useState(0)

    // Load play count for current track
    React.useEffect(() => {
        if (currentTrack?.id) {
            StorageService.getPlayCount(currentTrack.id as string).then(setPlayCount)
        }
    }, [currentTrack?.id])

    const handleSeek = (event: any) => {
        const { locationX } = event.nativeEvent
        const screenWidth = Dimensions.get('window').width - 48 // Account for padding
        const progressPercent = locationX / screenWidth
        const newPosition = progressPercent * progress.duration
        seekTo(newPosition)
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Şimdi Çalıyor" />
                <Appbar.Action 
                    icon={isFavorite ? "heart" : "heart-outline"} 
                    onPress={() => setIsFavorite(!isFavorite)} 
                />
            </Appbar.Header>

            <View style={styles.content}>
                <Card style={styles.coverCard}>
                    <Card.Content style={styles.coverContainer}>
                        <View style={[styles.cover, { backgroundColor: theme.colors.primary }]} />
                    </Card.Content>
                </Card>

                <View style={styles.trackInfo}>
                    <Text variant="headlineSmall" style={styles.title}>{title}</Text>
                    <Text variant="bodyLarge" style={styles.artist}>{currentTrack?.artist || 'Yerel'}</Text>
                    {surahInfo && (
                        <View style={styles.surahDetails}>
                            <Text variant="bodyMedium" style={styles.arabicName}>{surahInfo.name}</Text>
                            <Text variant="bodySmall" style={styles.ayahCount}>
                                {surahInfo.numberOfAyahs} Ayet • {surahInfo.revelationType}
                                {playCount > 0 && ` • ${playCount} dinleme`}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.progressContainer}>
                    <TouchableWithoutFeedback onPress={handleSeek}>
                        <View style={styles.progressWrapper}>
                            <ProgressBar 
                                progress={progress.duration > 0 ? progress.position / progress.duration : 0} 
                                style={styles.progressBar}
                            />
                            <View 
                                style={[
                                    styles.seekHandle, 
                                    { 
                                        left: `${progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0}%`,
                                        backgroundColor: theme.colors.primary 
                                    }
                                ]} 
                            />
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.timeRow}>
                        <Text variant="bodySmall">{formatTime(progress.position)}</Text>
                        <Text variant="bodySmall">{formatTime(progress.duration)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <IconButton
                        icon="skip-previous"
                        size={32}
                        onPress={skipToPrevious}
                        disabled={queue.length <= 1}
                    />
                    <IconButton
                        icon={isPlaying ? "pause" : "play"}
                        size={48}
                        mode="contained"
                        onPress={togglePlay}
                        style={styles.playButton}
                    />
                    <IconButton
                        icon="skip-next"
                        size={32}
                        onPress={skipToNext}
                        disabled={queue.length <= 1}
                    />
                </View>

                <View style={styles.bottomControls}>
                    <IconButton
                        icon={isRepeat ? "repeat" : "repeat-off"}
                        size={24}
                        onPress={() => setRepeat(!isRepeat)}
                        iconColor={isRepeat ? theme.colors.primary : undefined}
                    />
                    <Text variant="bodySmall" style={styles.queueInfo}>
                        {queue.length > 0 ? `${queue.findIndex(t => t.id === currentTrack?.id) + 1}/${queue.length}` : '1/1'}
                    </Text>
                    <IconButton
                        icon="shuffle"
                        size={24}
                        onPress={() => {}}
                    />
                </View>
            </View>
        </View>
    )
}

function formatTime(sec: number) {
    const s = Math.floor(sec)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')}`
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    coverCard: { marginBottom: 32, elevation: 8 },
    coverContainer: { padding: 0 },
    cover: { width: 280, height: 280, borderRadius: 16 },
    trackInfo: { alignItems: 'center', marginBottom: 32 },
    title: { textAlign: 'center', marginBottom: 8 },
    artist: { textAlign: 'center', opacity: 0.7, marginBottom: 8 },
    surahDetails: { alignItems: 'center', marginTop: 8 },
    arabicName: { textAlign: 'center', fontFamily: 'System', marginBottom: 4 },
    ayahCount: { textAlign: 'center', opacity: 0.6 },
    progressContainer: { width: '100%', marginBottom: 32 },
    progressWrapper: { position: 'relative', marginBottom: 8 },
    progressBar: { height: 6, borderRadius: 3 },
    seekHandle: { 
        position: 'absolute', 
        top: -4, 
        width: 14, 
        height: 14, 
        borderRadius: 7, 
        marginLeft: -7 
    },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    playButton: { marginHorizontal: 16 },
    bottomControls: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        paddingHorizontal: 16 
    },
    queueInfo: { opacity: 0.7 },
})