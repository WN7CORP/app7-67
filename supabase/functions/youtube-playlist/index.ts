import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY'); // Usando a mesma chave da Gemini

    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    if (!playlistId) {
      throw new Error('Playlist ID is required');
    }

    // Buscar informações da playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`);
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistData.items[0];

    // Buscar vídeos da playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // Buscar detalhes dos vídeos (duração, etc.)
    const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );

    const videoDetails = videoDetailsResponse.ok ? await videoDetailsResponse.json() : { items: [] };

    // Processar dados
    const processedPlaylist = {
      id: playlist.id,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default?.url,
      channelTitle: playlist.snippet.channelTitle,
      videoCount: playlist.contentDetails.itemCount,
      videos: videosData.items.map((video: any, index: number) => {
        const details = videoDetails.items?.find((detail: any) => detail.id === video.contentDetails.videoId);
        return {
          id: video.contentDetails.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          duration: details?.contentDetails?.duration || 'PT0S',
          viewCount: details?.statistics?.viewCount || '0',
          position: video.snippet.position,
          url: `https://www.youtube.com/watch?v=${video.contentDetails.videoId}`
        };
      })
    };

    return new Response(
      JSON.stringify(processedPlaylist),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in youtube-playlist function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        playlist: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});