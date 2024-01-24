export async function GET(req, res) {
    const basicAuth = Buffer.from(process.env.NEXT_PUBLIC_DYTE_ORGANIZATION_ID + ":" + process.env.NEXT_PUBLIC_DYTE_API_KEY).toString('base64');
    const userCreatedChatroomName = req.nextUrl.searchParams.get('userCreatedChatroomName');
    
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`
        },
        body: `{"title":"${userCreatedChatroomName}","preferred_region":"us-east-1","record_on_start":false,"live_stream_on_start":false,"recording_config":{"max_seconds":60,"file_name_prefix":"string","video_config":{"codec":"H264","width":1280,"height":720,"watermark":{"url":"http://example.com","size":{"width":1,"height":1},"position":"left top"}},"audio_config":{"codec":"AAC","channel":"stereo"},"storage_config":{"type":"aws","access_key":"string","secret":"string","bucket":"string","region":"us-east-1","path":"string","auth_method":"KEY","username":"string","password":"string","host":"string","port":0,"private_key":"string"},"dyte_bucket_config":{"enabled":true},"live_streaming_config":{"rtmp_url":"rtmp://a.rtmp.youtube.com/live2"}}}`
      };
      
      const response = await fetch('https://api.dyte.io/v2/meetings', options);
      const data = await response.json();

        if (response.ok) {
          return new Response(JSON.stringify(data.data));
        } else {
            console.log('Error')
            return new Response('ERROR');
        }
    } catch (error) {
      return new Response('Internal Error');
    }
}