export interface Track {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  duration: number; // in seconds
  audioUrl: string;
  coverArtUrl: string;
  bitrates: {
    normal: string;
    high: string;
    veryHigh: string;
    hifi?: string;
  };
  lyricsId?: string;
  playCount: number;
  releasedAt: string;
}
