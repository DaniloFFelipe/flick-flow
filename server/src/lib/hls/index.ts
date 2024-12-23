import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

interface EncodeOptions {
  inputFile: string
  outputDir: string
  resolutions?: { [key: string]: { width: number; height: number } }
}
export const defaultResolutions = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
}

export const encodeToHLS = async ({
  inputFile,
  outputDir,
  resolutions = defaultResolutions,
}: EncodeOptions): Promise<void> => {
  try {
    // Ensure output directory exists
    const fs = await import('fs/promises')
    await fs.mkdir(outputDir, { recursive: true })

    const masterPlaylist = path.join(outputDir, 'master.m3u8')
    const streams: string[] = []

    for (const [label, resolution] of Object.entries(resolutions)) {
      const outputSubDir = path.join(outputDir, label)
      await fs.mkdir(outputSubDir, { recursive: true })

      const videoOutput = path.join(outputSubDir, `output.m3u8`)
      const command = `
        ffmpeg -i "${inputFile}" \
        -vf "scale=w=${resolution.width}:h=${resolution.height}" \
        -c:v h264 -preset medium -b:v ${resolution.width * 0.5}k \
        -c:a aac -b:a 128k \
        -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${outputSubDir}/%03d.ts" \
        "${videoOutput}"
      `
      await execAsync(command)

      streams.push(`#EXT-X-STREAM-INF:BANDWIDTH=${resolution.width * 5000},RESOLUTION=${resolution.width}x${resolution.height}
${label}/output.m3u8`)
    }

    // Generate the master playlist
    const masterContent = `#EXTM3U\n${streams.join('\n')}`
    await fs.writeFile(masterPlaylist, masterContent)

    console.log('HLS encoding completed!')
  } catch (error) {
    console.error('Error encoding video:', error)
    throw error
  }
}

// // Usage
// ;(async () => {
//   const inputFile = 'example.mp4' // Path to your .mp4 file
//   const outputDir = 'output_hls' // Directory to save the HLS files

//   const resolutions = {
//     '480p': { width: 854, height: 480 },
//     '720p': { width: 1280, height: 720 },
//     '1080p': { width: 1920, height: 1080 },
//   }

//   await encodeToHLS({ inputFile, outputDir, resolutions })
// })()
