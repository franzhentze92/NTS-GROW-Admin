const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to parse video name and extract metadata
function parseVideoName(name) {
  // Remove file extension
  const nameWithoutExt = name.replace(/\.(mp4|avi|mov|mkv)$/i, '');
  
  // Define language patterns
  const languages = [
    'english', 'spanish', 'french', 'german', 'portuguese', 
    'mandarin', 'vietnamese', 'hindi', 'arabic'
  ];
  
  // Find language in the name
  let language = 'English'; // default
  let cleanName = nameWithoutExt;
  
  for (const lang of languages) {
    if (nameWithoutExt.toLowerCase().includes(lang)) {
      language = lang.charAt(0).toUpperCase() + lang.slice(1);
      // Remove language from name
      cleanName = nameWithoutExt.replace(new RegExp(`\\s*-?\\s*${lang}\\s*$`, 'i'), '').trim();
      break;
    }
  }
  
  // Extract season and episode
  let season = null;
  let episode = null;
  
  // Pattern 1: "S3 Episode 1" or "S2 Episode 17"
  const seasonEpisodePattern1 = /S(\d+)\s+Episode\s+(\d+)/i;
  const match1 = cleanName.match(seasonEpisodePattern1);
  if (match1) {
    season = parseInt(match1[1]);
    episode = parseInt(match1[2]);
    cleanName = cleanName.replace(seasonEpisodePattern1, '').trim();
  }
  
  // Pattern 2: "Episode 15" (Season 1 implied)
  const episodePattern = /Episode\s+(\d+)/i;
  const match2 = cleanName.match(episodePattern);
  if (match2 && !season) {
    season = 1; // Default to season 1 if not specified
    episode = parseInt(match2[1]);
    cleanName = cleanName.replace(episodePattern, '').trim();
  }
  
  // Clean up the title
  cleanName = cleanName.replace(/^[-:\s]+/, '').replace(/[-:\s]+$/, '');
  
  return {
    originalName: name,
    title: cleanName,
    season: season,
    episode: episode,
    language: language
  };
}

// Read and process the CSV
const videos = [];

fs.createReadStream('GROW Video Library Metadata or GROW Video Links Export.csv')
  .pipe(csv())
  .on('data', (row) => {
    const parsed = parseVideoName(row.Name);
    
    videos.push({
      id: row.ID,
      title: parsed.title,
      season: parsed.season,
      episode: parsed.episode,
      language: parsed.language,
      google_drive_file_id: row.ID,
      preview_link: row['Preview Link'],
      direct_download_link: row['Direct Download Link'],
      mime_type: row['MIME Type'],
      folder_path: row['Folder Path'],
      original_name: parsed.originalName,
      description: `Episode ${parsed.episode} of Season ${parsed.season} - ${parsed.title}`,
      tags: [parsed.language.toLowerCase(), `season-${parsed.season}`, `episode-${parsed.episode}`],
      category_id: 'education',
      privacy_status: 'unlisted',
      youtube_video_id: '',
      upload_status: 'completed',
      upload_date: new Date().toISOString().split('T')[0],
      duration: 'N/A',
      thumbnail_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  })
  .on('end', () => {
    console.log(`Processed ${videos.length} videos`);
    
    // Write the processed data to a new CSV
    const csvWriter = createCsvWriter({
      path: 'processed-videos.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'season', title: 'Season' },
        { id: 'episode', title: 'Episode' },
        { id: 'language', title: 'Language' },
        { id: 'google_drive_file_id', title: 'Google Drive File ID' },
        { id: 'preview_link', title: 'Preview Link' },
        { id: 'description', title: 'Description' },
        { id: 'tags', title: 'Tags' },
        { id: 'folder_path', title: 'Folder Path' },
        { id: 'original_name', title: 'Original Name' }
      ]
    });
    
    csvWriter.writeRecords(videos)
      .then(() => {
        console.log('✅ Processed CSV written to processed-videos.csv');
        
        // Also create a JSON file for easy import into the frontend
        const jsonData = {
          videos: videos,
          metadata: {
            total_videos: videos.length,
            languages: [...new Set(videos.map(v => v.language))],
            seasons: [...new Set(videos.map(v => v.season).filter(s => s))].sort((a, b) => a - b),
            processed_at: new Date().toISOString()
          }
        };
        
        fs.writeFileSync('processed-videos.json', JSON.stringify(jsonData, null, 2));
        console.log('✅ JSON file written to processed-videos.json');
        
        // Show some statistics
        console.log('\n📊 Statistics:');
        console.log(`Total videos: ${videos.length}`);
        console.log(`Languages: ${jsonData.metadata.languages.join(', ')}`);
        console.log(`Seasons: ${jsonData.metadata.seasons.join(', ')}`);
        
        // Show sample of processed data
        console.log('\n📝 Sample processed videos:');
        videos.slice(0, 3).forEach(video => {
          console.log(`- ${video.title} (S${video.season}E${video.episode}, ${video.language})`);
        });
      });
  }); 