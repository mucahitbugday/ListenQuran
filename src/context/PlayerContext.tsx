import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event, RepeatMode, State, Track, usePlaybackState, useProgress, useTrackPlayerEvents } from 'react-native-track-player'
import surahData from '../data/surah.json'
import { StorageService } from '../utils/storage'

type PlayerContextValue = {
    isReady: boolean
    currentTrack?: Track | null
    queue: Track[]
    isPlaying: boolean
    progress: {
        position: number
        duration: number
        buffered: number
    }
    play: (track?: Track | string) => Promise<void>
    pause: () => Promise<void>
    togglePlay: () => Promise<void>
    seekTo: (position: number) => Promise<void>
    skipToNext: () => Promise<void>
    skipToPrevious: () => Promise<void>
    setQueue: (tracks: Track[]) => Promise<void>
    currentIndex: number
    isRepeat: boolean
    setRepeat: (repeat: boolean) => void
    getSurahInfo: (surahNumber: number) => any
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

let setupDone = false
async function setupPlayerOnce(): Promise<void> {
    if (setupDone) return
    await TrackPlayer.setupPlayer({})
    await TrackPlayer.updateOptions({
        android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
        ],
        progressUpdateEventInterval: 1,
        notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
        ],
    })
    await TrackPlayer.setRepeatMode(RepeatMode.Off)
    setupDone = true
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const playback = usePlaybackState()
    const progressHook = useProgress(250)
    const [isReady, setIsReady] = useState(false)
    const [queue, setQueueState] = useState<Track[]>([])
    const [currentTrack, setCurrentTrack] = useState<Track | null>()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isRepeat, setIsRepeat] = useState(false)

    useEffect(() => {
        setupPlayerOnce().then(() => setIsReady(true))
    }, [])

    useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded, Event.PlaybackState], async (event) => {
        if (event.type === Event.PlaybackActiveTrackChanged && event.index != null) {
            const track = await TrackPlayer.getTrack(event.index)
            setCurrentTrack(track)
            setCurrentIndex(event.index)
        }
        if (event.type === Event.PlaybackQueueEnded) {
            if (isRepeat && currentTrack) {
                // Repeat current track
                await TrackPlayer.seekTo(0)
                await TrackPlayer.play()
            } else if (currentIndex < queue.length - 1) {
                // Auto-play next track
                await skipToNext()
            }
        }
        if (event.type === Event.PlaybackState && event.state === State.Playing && currentTrack) {
            // Track play count when playback starts
            await StorageService.incrementPlayCount(currentTrack.id as string)
        }
    })

    const isPlaying = playback.state === State.Playing

    const getSurahInfo = useCallback((surahNumber: number) => {
        return surahData.find(surah => surah.number === surahNumber) || null
    }, [])

    const setQueue = useCallback(async (tracks: Track[]) => {
        await TrackPlayer.reset()
        
        // Sort tracks by surah number to ensure numerical order
        const sortedTracks = [...tracks].sort((a, b) => {
            const aNum = parseInt(a.title?.match(/^(\d+)\./)?.[1] || '0')
            const bNum = parseInt(b.title?.match(/^(\d+)\./)?.[1] || '0')
            return aNum - bNum
        })
        
        // Enhance tracks with metadata for media controls
        const enhancedTracks = sortedTracks.map(track => {
            const surahNumber = track.title?.match(/^(\d+)\./)?.[1]
            const surahInfo = surahNumber ? getSurahInfo(parseInt(surahNumber)) : null
            
            return {
                ...track,
                title: track.title || 'Unknown',
                artist: track.artist || 'ar.alafasy',
                album: 'Quran - ar.alafasy',
                artwork: track.artwork || 'https://via.placeholder.com/300x300/445570/ffffff?text=Quran',
                genre: 'Religious',
                date: '2024',
                duration: track.duration || 0,
            }
        })
        
        await TrackPlayer.add(enhancedTracks)
        setQueueState(enhancedTracks)
        if (enhancedTracks.length > 0) {
            setCurrentTrack(enhancedTracks[0])
            setCurrentIndex(0)
        }
    }, [getSurahInfo])

    const play = useCallback(async (track?: Track | string) => {
        if (track) {
            const t: Track = typeof track === 'string' ? { id: track, url: track, title: 'Audio' } : track
            const existing = queue.find(q => q.id === t.id)
            if (!existing) {
                await TrackPlayer.reset()
                await TrackPlayer.add([t])
                setQueueState([t])
                setCurrentTrack(t)
                setCurrentIndex(0)
            }
        }
        await TrackPlayer.play()
    }, [queue])

    const pause = useCallback(async () => {
        await TrackPlayer.pause()
    }, [])

    const togglePlay = useCallback(async () => {
        if (isPlaying) await TrackPlayer.pause(); else await TrackPlayer.play()
    }, [isPlaying])

    const seekTo = useCallback(async (position: number) => {
        await TrackPlayer.seekTo(position)
    }, [])

    const skipToNext = useCallback(async () => {
        if (currentIndex < queue.length - 1) {
            await TrackPlayer.skipToNext().catch(() => {})
        }
    }, [currentIndex, queue.length])

    const skipToPrevious = useCallback(async () => {
        if (currentIndex > 0) {
            await TrackPlayer.skipToPrevious().catch(() => {})
        }
    }, [currentIndex])

    const setRepeat = useCallback((repeat: boolean) => {
        setIsRepeat(repeat)
    }, [])

    const value = useMemo<PlayerContextValue>(() => ({
        isReady,
        currentTrack,
        queue,
        isPlaying,
        progress: {
            position: progressHook.position,
            duration: progressHook.duration,
            buffered: progressHook.buffered,
        },
        play,
        pause,
        togglePlay,
        seekTo,
        skipToNext,
        skipToPrevious,
        setQueue,
        currentIndex,
        isRepeat,
        setRepeat,
        getSurahInfo,
    }), [isReady, currentTrack, queue, isPlaying, progressHook, play, pause, togglePlay, seekTo, skipToNext, skipToPrevious, setQueue, currentIndex, isRepeat, setRepeat, getSurahInfo])

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    )
}

export function usePlayer() {
    const ctx = useContext(PlayerContext)
    if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
    return ctx
}


