const fs = require('fs');

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

// Function to parse CSV manually
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const videos = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    // Simple CSV parsing (handles quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/"/g, '') : '';
      });
      videos.push(row);
    }
  }
  
  return videos;
}

// Main processing
try {
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync('GROW Video Library Metadata or GROW Video Links Export.csv', 'utf8');
  
  console.log('🔍 Parsing CSV...');
  const rawVideos = parseCSV(csvContent);
  
  console.log('🔄 Processing video names...');
  const processedVideos = rawVideos.map(row => {
    const parsed = parseVideoName(row.Name);
    
    return {
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
    };
  });
  
  console.log(`✅ Processed ${processedVideos.length} videos`);
  
  // Create JSON file for easy import into the frontend
  const jsonData = {
    videos: processedVideos,
    metadata: {
      total_videos: processedVideos.length,
      languages: [...new Set(processedVideos.map(v => v.language))],
      seasons: [...new Set(processedVideos.map(v => v.season).filter(s => s))].sort((a, b) => a - b),
      processed_at: new Date().toISOString()
    }
  };
  
  fs.writeFileSync('processed-videos.json', JSON.stringify(jsonData, null, 2));
  console.log('✅ JSON file written to processed-videos.json');
  
  // Show statistics
  console.log('\n📊 Statistics:');
  console.log(`Total videos: ${processedVideos.length}`);
  console.log(`Languages: ${jsonData.metadata.languages.join(', ')}`);
  console.log(`Seasons: ${jsonData.metadata.seasons.join(', ')}`);
  
  // Show sample of processed data
  console.log('\n📝 Sample processed videos:');
  processedVideos.slice(0, 5).forEach(video => {
    console.log(`- ${video.title} (S${video.season}E${video.episode}, ${video.language})`);
  });
  
  // Create a simple CSV for reference
  const csvOutput = [
    'ID,Title,Season,Episode,Language,Google Drive File ID,Preview Link,Description,Tags',
    ...processedVideos.map(v => [
      v.id,
      `"${v.title}"`,
      v.season,
      v.episode,
      v.language,
      v.google_drive_file_id,
      `"${v.preview_link}"`,
      `"${v.description}"`,
      `"${v.tags.join(', ')}"`
    ].join(','))
  ].join('\n');
  
  fs.writeFileSync('processed-videos.csv', csvOutput);
  console.log('✅ CSV file written to processed-videos.csv');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} 