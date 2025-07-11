import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import {
  getAllDownloads,
  pauseDownload,
  resumeDownload,
  removeDownload,
  type DownloadItem
} from 'react-native-tpstreams';
import { useFocusEffect } from '@react-navigation/native';

const DownloadScreen = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load downloads when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDownloads();
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setIsLoading(true);
    try {
      const items = await getAllDownloads();
      setDownloads(items);
    } catch (error) {
      console.error('Failed to load downloads:', error);
      Alert.alert('Error', 'Failed to load downloads');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseDownload = async (videoId: string) => {
    try {
      // Update UI immediately
      setDownloads(prevDownloads => 
        prevDownloads.map(item => 
          item.videoId === videoId 
            ? { ...item, state: 'Paused' } 
            : item
        )
      );
      
      // Then perform the actual pause operation
      await pauseDownload(videoId);
    } catch (error) {
      console.error(`Error pausing download for video ID: ${videoId}`, error);
      Alert.alert('Error', 'Failed to pause download');
      
      // Revert UI on error
      loadDownloads();
    }
  };

  const handleResumeDownload = async (videoId: string) => {
    try {
      // Update UI immediately
      setDownloads(prevDownloads => 
        prevDownloads.map(item => 
          item.videoId === videoId 
            ? { ...item, state: 'Downloading' } 
            : item
        )
      );
      
      // Get all currently downloading items
      const currentDownloads = downloads.filter(item => 
        item.state === 'Downloading' && item.videoId !== videoId
      );
      
      // Pause all other active downloads first
      if (currentDownloads.length > 0) {
        // Update UI for other downloads
        setDownloads(prevDownloads => 
          prevDownloads.map(item => {
            if (currentDownloads.some(d => d.videoId === item.videoId)) {
              return { ...item, state: 'Paused' };
            }
            return item;
          })
        );
        
        for (const download of currentDownloads) {
          await pauseDownload(download.videoId);
        }
      }
      
      // Resume the requested download
      await resumeDownload(videoId);
      
      // Resume other downloads that were paused
      if (currentDownloads.length > 0) {
        for (const download of currentDownloads) {
          await resumeDownload(download.videoId);
          
          // Update UI for each resumed download
          setDownloads(prevDownloads => 
            prevDownloads.map(item => 
              item.videoId === download.videoId
                ? { ...item, state: 'Downloading' }
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error resuming download for video ID: ${videoId}`, error);
      Alert.alert('Error', 'Failed to resume download');
      
      // Revert UI on error
      loadDownloads();
    }
  };

  const handleRemoveDownload = async (videoId: string) => {
    try {
      // Update UI immediately
      setDownloads(prevDownloads => 
        prevDownloads.filter(item => item.videoId !== videoId)
      );
      
      // Then perform the actual remove operation
      await removeDownload(videoId);
    } catch (error) {
      console.error(`Error removing download for video ID: ${videoId}`, error);
      Alert.alert('Error', 'Failed to remove download');
      
      // Refresh to get actual state on error
      loadDownloads();
    }
  };

  const renderDownloadItem = (item: DownloadItem) => {
    const videoId = item.videoId;
    const isCompleted = item.state === 'Completed';
    
    return (
      <View style={styles.downloadItem} key={videoId}>
        <View style={styles.downloadHeader}>
          {item.thumbnailUrl ? (
            <Image 
              source={{ uri: item.thumbnailUrl }} 
              style={styles.thumbnail} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailPlaceholderText}>No Thumbnail</Text>
            </View>
          )}
          <View style={styles.downloadDetails}>
            <Text style={styles.downloadTitle} numberOfLines={2} ellipsizeMode="tail">
              {item.title || 'Untitled Video'}
            </Text>
            <Text style={styles.downloadStatus}>
              Status: {item.state}
            </Text>
            
            {!isCompleted && item.progressPercentage < 100 && (
              <View style={styles.progressSection}>
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${item.progressPercentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.progressPercentage.toFixed(0)}%
                </Text>
              </View>
            )}
            
            {!isCompleted && item.totalBytes > 0 && (
              <Text style={styles.bytesText}>
                {(item.downloadedBytes / (1024 * 1024)).toFixed(1)} MB / {(item.totalBytes / (1024 * 1024)).toFixed(1)} MB
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          {!isCompleted && (
            <>
              {item.state === 'Downloading' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePauseDownload(videoId)}
                >
                  <Text style={styles.actionButtonText}>Pause</Text>
                </TouchableOpacity>
              )}
              
              {item.state === 'Paused' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleResumeDownload(videoId)}
                >
                  <Text style={styles.actionButtonText}>Resume</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveDownload(videoId)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollViewContent}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      ) : downloads.length > 0 ? (
        <View style={styles.downloadsContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Downloads</Text>
            <TouchableOpacity 
              onPress={loadDownloads} 
              style={styles.refreshButton}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {downloads.map(renderDownloadItem)}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No downloads available</Text>
          <Text style={styles.emptySubText}>
            Videos you download will appear here
          </Text>
          <TouchableOpacity 
            style={styles.refreshEmptyButton}
            onPress={loadDownloads}
          >
            <Text style={styles.refreshEmptyButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadsContainer: {
    width: '100%',
  },
  downloadItem: {
    backgroundColor: '#fff',
    marginBottom: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  downloadHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnail: {
    width: 100,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  downloadDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  downloadStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 36,
    textAlign: 'right',
  },
  bytesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 16,
  },
  refreshEmptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshEmptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DownloadScreen; 