import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  TPStreamsPlayerView,
  TPStreamsPlayerRef,
} from 'react-native-tpstreams';

const DEFAULT_VIDEO_ID = '8kbXc9Gg2Rj';

const TOKENS_FOR_PLAYBACK = [
  '2aa822c4-fcf5-4bcf-b2e6-a724aff22aa9'
];


const REFRESH_TOKENS = [
  'f1adb15f-bee8-447f-ab42-9339413e1c24',
  'cb919c30-3212-4a0c-b4ee-37d785ed3c9a'
];

interface HomeScreenProps {
  route?: {
    params?: {
      videoId?: string;
      title?: string;
    };
  };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route }) => {
  const playerRef = useRef<TPStreamsPlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerInstanceKey, setPlayerInstanceKey] = useState(0);
  const [videoId, setVideoId] = useState(DEFAULT_VIDEO_ID);
  const [title, setTitle] = useState('Video Player');
  const [isLoadingLicense, setIsLoadingLicense] = useState(false);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [currentOneTimeTokenIndex, setCurrentOneTimeTokenIndex] = useState(0);

  const getCurrentOneTimeToken = () => {
    return TOKENS_FOR_PLAYBACK[currentOneTimeTokenIndex];
  };

  const rotateOneTimeToken = () => {
    const nextIndex = (currentOneTimeTokenIndex + 1) % TOKENS_FOR_PLAYBACK.length;
    setCurrentOneTimeTokenIndex(nextIndex);
  };

  useEffect(() => {
    if (route?.params?.videoId) {
      setVideoId(route.params.videoId);
      setPlayerInstanceKey(prev => prev + 1);
      rotateOneTimeToken();
    }
    if (route?.params?.title) {
      setTitle(route.params.title);
    }
  }, [route?.params]);

  const getNewTokenForVideo = async (videoId: string): Promise<string> => {
    const nextTokenIndex = (currentTokenIndex + 1) % REFRESH_TOKENS.length;
    const newToken = REFRESH_TOKENS[nextTokenIndex];
    setCurrentTokenIndex(nextTokenIndex);
    return newToken;
  };

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
            const newPosition = Math.max(0, position - 10000);
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
            playerRef.current?.seekTo(position + 10000);
          }
        })
        .catch(error => {
          console.error('Error seeking forward:', error);
        });
    }
  };

  const handleError = (error: {message: string, code: number, details?: string}) => {
    if (error.code === 1000) {
      Alert.alert('Download Started', 'The video download has started. You can view it in the Downloads tab.');
    } else if (error.code === 1001) {
      Alert.alert('Download Complete', 'The video has been downloaded successfully. You can view it in the Downloads tab.');
    } else if (error.code === 1002) {
      Alert.alert('Download Failed', `The video download failed: ${error.message}`);
    } else if (error.code === 5001) {
      setIsLoadingLicense(true);
      setTimeout(() => {
        if (isLoadingLicense) {
          setIsLoadingLicense(false);
        }
      }, 5000);
    } else {
      console.error('[HomeScreen] Player error:', error);
      if (error.message && error.message.includes('token')) {
        console.log('[HomeScreen] Token error for video playback, rotating token...');
        rotateOneTimeToken();
        setPlayerInstanceKey(prev => prev + 1);
      }
    }
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.playerContainer}>
            <TPStreamsPlayerView
              key={playerInstanceKey}
              ref={playerRef}
              videoId={videoId}
              accessToken={getCurrentOneTimeToken()}
              style={styles.player}
              shouldAutoPlay={false}
              showDefaultCaptions={true}
              enableDownload={true}
              offlineLicenseExpireTime={90}
              onError={handleError}
              onIsLoadingChanged={(isLoading) => {
                if (!isLoading && isLoadingLicense) {
                  setIsLoadingLicense(false);
                }
              }}
              onAccessTokenExpired={async (videoId, callback) => {
                try {
                  console.log('[HomeScreen] Access token expired for download:', videoId);
                  const newToken = await getNewTokenForVideo(videoId);
                  callback(newToken);
                } catch (error) {
                  console.error('[HomeScreen] Error refreshing download token:', error);
                  const nextTokenIndex = (currentTokenIndex + 1) % REFRESH_TOKENS.length;
                  const fallbackToken = REFRESH_TOKENS[nextTokenIndex];
                  callback(fallbackToken);
                }
              }}
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
      
      {/* Modal loader that works in both portrait and fullscreen */}
      <Modal
        visible={isLoadingLicense}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.modalText}>Fetching license...</Text>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  modalText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen; 