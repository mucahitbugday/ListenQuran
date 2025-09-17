import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Appbar, Button, Card, List, ProgressBar, Switch, Text, useTheme } from 'react-native-paper'
import RNFS from 'react-native-fs'
import { PermissionsAndroid, Platform, AppState } from 'react-native'

export default function SettingsScreen() {
    const theme = useTheme()
    const [backgroundPlay, setBackgroundPlay] = React.useState(true)
    const [notifications, setNotifications] = React.useState(true)
    const [autoPlay, setAutoPlay] = React.useState(false)
    const [downloading, setDownloading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [downloadedCount, setDownloadedCount] = React.useState(0)
    const [currentDownload, setCurrentDownload] = React.useState('')
    const downloadRef = React.useRef<boolean>(false)

    const APP_DIR = `${RNFS.DownloadDirectoryPath}/ListenQuran/ar.alafasy`

    const ensureFolders = React.useCallback(async () => {
        if (Platform.OS !== 'android') return
        const perms = []
        if (Platform.Version >= 33) perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO)
        else perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        await PermissionsAndroid.requestMultiple(perms as any)
        const exists = await RNFS.exists(APP_DIR)
        if (!exists) await RNFS.mkdir(APP_DIR)
    }, [APP_DIR])

    const buildUrl = (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`

    const downloadAll = React.useCallback(async () => {
        try {
            setDownloading(true)
            setProgress(0)
            setDownloadedCount(0)
            downloadRef.current = true
            await ensureFolders()
            
            let done = 0
            const total = 114
            
            for (let i = 1; i <= 114 && downloadRef.current; i++) {
                const filePath = `${APP_DIR}/surah${i}.mp3`
                const already = await RNFS.exists(filePath)
                
                if (!already) {
                    setCurrentDownload(`Surah ${i}`)
                    try {
                        await RNFS.downloadFile({
                            fromUrl: buildUrl(i),
                            toFile: filePath,
                        }).promise
                        setDownloadedCount(prev => prev + 1)
                    } catch (e) {
                        console.log(`Failed to download surah ${i}:`, e)
                    }
                }
                
                done += 1
                setProgress(done / total)
                
                // Small delay to prevent overwhelming the system
                await new Promise<void>(resolve => setTimeout(resolve, 100))
            }
        } catch (e) {
            console.log('Download error:', e)
        } finally {
            setDownloading(false)
            setCurrentDownload('')
            downloadRef.current = false
        }
    }, [APP_DIR, ensureFolders])

    const cancelDownload = React.useCallback(() => {
        downloadRef.current = false
        setDownloading(false)
        setCurrentDownload('')
    }, [])

    // Handle app state changes for background downloads
    React.useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'background' && downloading) {
                // Continue download in background
                console.log('App went to background, continuing download...')
            }
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription?.remove()
    }, [downloading])

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => {}} />
                <Appbar.Content title="Ayarlar" />
            </Appbar.Header>

            <View style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Çalma Ayarları</Text>
                        
                        <List.Item
                            title="Arkaplanda Çalma"
                            description="Uygulama kapalıyken müzik çalmaya devam etsin"
                            left={(props) => <List.Icon {...props} icon="play-circle" />}
                            right={() => (
                                <Switch
                                    value={backgroundPlay}
                                    onValueChange={setBackgroundPlay}
                                />
                            )}
                        />
                        
                        <List.Item
                            title="Otomatik Çalma"
                            description="Şarkı bittiğinde bir sonrakini otomatik çal"
                            left={(props) => <List.Icon {...props} icon="skip-next" />}
                            right={() => (
                                <Switch
                                    value={autoPlay}
                                    onValueChange={setAutoPlay}
                                />
                            )}
                        />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Bildirimler</Text>
                        
                        <List.Item
                            title="Bildirimleri Göster"
                            description="Çalma kontrollerini bildirim alanında göster"
                            left={(props) => <List.Icon {...props} icon="bell" />}
                            right={() => (
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                />
                            )}
                        />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Hakkında</Text>
                        
                        <List.Item
                            title="Uygulama Versiyonu"
                            description="1.0.0"
                            left={(props) => <List.Icon {...props} icon="information" />}
                        />
                        
                        <List.Item
                            title="Geliştirici"
                            description="ListenQuran Team"
                            left={(props) => <List.Icon {...props} icon="account-group" />}
                        />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>İndirmeler</Text>
                        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>ar.alafasy 1-114 sûreleri indir</Text>
                        
                        {downloading && (
                            <>
                                <ProgressBar progress={progress} style={{ marginBottom: 8 }} />
                                <Text variant="bodySmall" style={{ marginBottom: 8 }}>
                                    İndirilen: {downloadedCount}/114
                                </Text>
                                {currentDownload && (
                                    <Text variant="bodySmall" style={{ marginBottom: 12, opacity: 0.7 }}>
                                        Şu an indiriliyor: {currentDownload}
                                    </Text>
                                )}
                            </>
                        )}
                        
                        <View style={styles.buttonRow}>
                            <Button 
                                mode="contained" 
                                onPress={downloadAll} 
                                disabled={downloading}
                                style={styles.downloadButton}
                            >
                                {downloading ? 'İndiriliyor...' : 'Tüm Sureleri İndir'}
                            </Button>
                            
                            {downloading && (
                                <Button 
                                    mode="outlined" 
                                    onPress={cancelDownload}
                                    style={styles.cancelButton}
                                >
                                    İptal
                                </Button>
                            )}
                        </View>
                        
                        <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.6 }}>
                            İndirme arkaplanda devam eder
                        </Text>
                    </Card.Content>
                </Card>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    card: { marginBottom: 16 },
    sectionTitle: { marginBottom: 16, fontWeight: '600' },
    buttonRow: { flexDirection: 'row', gap: 12 },
    downloadButton: { flex: 1 },
    cancelButton: { flex: 1 }
})