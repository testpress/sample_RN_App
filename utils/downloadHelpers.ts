import {
  pauseDownload,
  resumeDownload,
  removeDownload,
  getAllDownloads,
  getDownloadStatus,
  isDownloaded,
  isDownloading,
  type DownloadItem,
} from 'react-native-tpstreams';

export const loadDownloads = async () => {
  try {
    const items: DownloadItem[] = await getAllDownloads();
    console.log(`[DownloadHelpers] Found ${items.length} downloads`);
    return items;
  } catch (error) {
    console.error('[DownloadHelpers] Failed to load downloads:', error);
    throw error;
  }
};

export const checkStatus = async (videoId: string) => {
  try {
    const status = await getDownloadStatus(videoId);
    console.log(`[DownloadHelpers] Status for ${videoId}: ${status}`);
    return status;
  } catch (error) {
    console.error('[DownloadHelpers] Error checking status:', error);
    throw error;
  }
};

export const checkIfDownloaded = async (videoId: string) => {
  try {
    const downloaded: boolean = await isDownloaded(videoId);
    console.log(`[DownloadHelpers] Is downloaded for ${videoId}: ${downloaded}`);
    return downloaded;
  } catch (error) {
    console.error('[DownloadHelpers] Error checking if downloaded:', error);
    throw error;
  }
};

export const checkIfDownloading = async (videoId: string) => {
  try {
    const downloading: boolean = await isDownloading(videoId);
    console.log(`[DownloadHelpers] Is downloading for ${videoId}: ${downloading}`);
    return downloading;
  } catch (error) {
    console.error('[DownloadHelpers] Error checking if downloading:', error);
    throw error;
  }
};

export const pauseVideoDownload = async (videoId: string) => {
  try {
    await pauseDownload(videoId);
    console.log('[DownloadHelpers] Download paused successfully');
    
    const status = await getDownloadStatus(videoId);
    console.log(`[DownloadHelpers] New status: ${status}`);
    return status;
  } catch (error) {
    console.error('[DownloadHelpers] Error pausing download:', error);
    throw error;
  }
};

export const resumeVideoDownload = async (videoId: string) => {
  try {
    await resumeDownload(videoId);
    console.log('[DownloadHelpers] Download resumed');
    
    const status = await getDownloadStatus(videoId);
    console.log(`[DownloadHelpers] New status: ${status}`);
    return status;
  } catch (error) {
    console.error('[DownloadHelpers] Error resuming download:', error);
    throw error;
  }
};

export const removeVideoDownload = async (videoId: string) => {
  try {
    await removeDownload(videoId);
    console.log('[DownloadHelpers] Download removed');
  } catch (error) {
    console.error('[DownloadHelpers] Error removing download:', error);
    throw error;
  }
};

export const getDownloadInfo = async (videoId: string) => {
  try {
    const [status, downloaded, downloading] = await Promise.all([
      getDownloadStatus(videoId),
      isDownloaded(videoId),
      isDownloading(videoId),
    ]);

    return {
      videoId,
      status,
      isDownloaded: downloaded,
      isDownloading: downloading,
    };
  } catch (error) {
    console.error('[DownloadHelpers] Error getting download info:', error);
    throw error;
  }
}; 