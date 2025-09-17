import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Appbar, Avatar, Card, List, Text, useTheme } from 'react-native-paper'

export default function ProfileScreen() {
  const theme = useTheme()
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Profil" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.name}>Misafir Kullanıcı</Text>
            <Text variant="bodyMedium" style={styles.email}>misafir@example.com</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <List.Item
              title="Toplam Şarkı"
              description="0 parça"
              left={(props) => <List.Icon {...props} icon="music" />}
            />
            <List.Item
              title="Çalma Süresi"
              description="0 dakika"
              left={(props) => <List.Icon {...props} icon="clock" />}
            />
            <List.Item
              title="Favori Sanatçı"
              description="Henüz yok"
              left={(props) => <List.Icon {...props} icon="heart" />}
            />
          </Card.Content>
        </Card>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  profileCard: { marginBottom: 16 },
  profileContent: { alignItems: 'center', paddingVertical: 24 },
  avatar: { marginBottom: 16 },
  name: { marginBottom: 8 },
  email: { opacity: 0.7 },
  statsCard: { marginBottom: 16 },
})