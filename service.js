const TrackPlayer = require('react-native-track-player').default;
const { Event } = require('react-native-track-player');

module.exports = async function () {
  // Handle remote play/pause
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('Remote play');
    TrackPlayer.play();
  });
  
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Remote pause');
    TrackPlayer.pause();
  });
  
  // Handle remote next/previous
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('Remote next');
    TrackPlayer.skipToNext();
  });
  
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('Remote previous');
    TrackPlayer.skipToPrevious();
  });
  
  // Handle remote seek
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log('Remote seek to:', event.position);
    TrackPlayer.seekTo(event.position);
  });
  
  // Handle remote stop
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('Remote stop');
    TrackPlayer.stop();
  });
  
  // Handle remote jump forward/backward
  TrackPlayer.addEventListener(Event.RemoteJumpForward, (event) => {
    console.log('Remote jump forward:', event.interval);
    TrackPlayer.getPosition().then(position => {
      TrackPlayer.seekTo(position + event.interval);
    });
  });
  
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, (event) => {
    console.log('Remote jump backward:', event.interval);
    TrackPlayer.getPosition().then(position => {
      TrackPlayer.seekTo(Math.max(0, position - event.interval));
    });
  });
};