import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json()
    
    if (!playlistId) {
      return new Response(
        JSON.stringify({ error: 'playlistId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const YOUTUBE_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not found')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch playlist details
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    const playlistResponse = await fetch(playlistUrl)
    
    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`)
    }
    
    const playlistData = await playlistResponse.json()
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Playlist not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const playlist = playlistData.items[0]
    
    // Get high quality thumbnail
    const thumbnailUrl = playlist.snippet.thumbnails?.maxres?.url || 
                        playlist.snippet.thumbnails?.high?.url || 
                        playlist.snippet.thumbnails?.medium?.url || 
                        playlist.snippet.thumbnails?.default?.url || ''

    const result = {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      channelTitle: playlist.snippet.channelTitle,
      thumbnailUrl,
      videoCount: playlist.contentDetails.itemCount || 0,
      publishedAt: playlist.snippet.publishedAt
    }

    console.log('Playlist details fetched successfully:', result.title)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error fetching playlist details:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch playlist details' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})