import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TPStreamsPlayerView,
  TPStreamsPlayerRef,
} from 'react-native-tpstreams';

const VIDEO_ID = 'BEArYFdaFbt';
const ACCESS_TOKEN = 'e6a1b485-daad-42eb-8cf2-6b6e51631092';

const HomeScreen = () => {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerInstanceKey, setPlayerInstanceKey] = useState(0);

  // Player control functions
  const playVideo = () => {
    playerRef.current?.play();
  };

  const pauseVideo = () => {
    playerRef.current?.pause();
  };

  const seekBackward = () => {
    if (playerRef.current) {
      playerRef.current.getCurrentPosition()
        .then(position => {
          if (position !== undefined) {
            const newPosition = Math.max(0, position - 10000); // Go back 10 seconds
            playerRef.current?.seekTo(newPosition);
          }
        })
        .catch(error => {
          console.error('Error seeking backward:', error);
        });
    }
  };

  const seekForward = () => {
    if (playerRef.current) {
      playerRef.current.getCurrentPosition()
        .then(position => {
          if (position !== undefined) {
            playerRef.current?.seekTo(position + 10000); // Go forward 10 seconds
          }
        })
        .catch(error => {
          console.error('Error seeking forward:', error);
        });
    }
  };

  // Handle download-related events through the error handler
  const handleError = (error: {message: string, code: number, details?: string}) => {
    // Check if the error is actually a download notification
    if (error.code === 1000) {
      // Download started
      Alert.alert('Download Started', 'The video download has started. You can view it in the Downloads tab.');
    } else if (error.code === 1001) {
      // Download completed
      Alert.alert('Download Complete', 'The video has been downloaded successfully. You can view it in the Downloads tab.');
    } else if (error.code === 1002) {
      // Download failed
      Alert.alert('Download Failed', `The video download failed: ${error.message}`);
    } else {
      // Regular error
      console.error('Player error:', error);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.playerContainer}>
          <TPStreamsPlayerView
            key={playerInstanceKey}
            ref={playerRef}
            videoId={VIDEO_ID}
            accessToken={ACCESS_TOKEN}
            style={styles.player}
            shouldAutoPlay={false}
            showDefaultCaptions={true}
            enableDownload={true}
            onError={handleError}
          />
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.sectionTitle}>Player Controls</Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={seekBackward}
            >
              <Text style={styles.controlButtonText}>-10s</Text>
            </TouchableOpacity>
            
            {isPlaying ? (
              <TouchableOpacity 
                style={[styles.controlButton, styles.primaryButton]} 
                onPress={pauseVideo}
              >
                <Text style={[styles.controlButtonText, styles.primaryButtonText]}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.controlButton, styles.primaryButton]} 
                onPress={playVideo}
              >
                <Text style={[styles.controlButtonText, styles.primaryButtonText]}>Play</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={seekForward}
            >
              <Text style={styles.controlButtonText}>+10s</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.downloadHint}>
            To download this video for offline viewing, tap the download button in the player controls.
            Downloaded videos will appear in the Downloads tab.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingBottom: 20,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  player: {
    height: 250,
  },
  controlsContainer: {
    width: '100%',
    padding: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#eaeaea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    minWidth: 100,
  },
  controlButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButtonText: {
    color: '#fff',
  },
  downloadHint: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 16,
  },
});

export default HomeScreen; 