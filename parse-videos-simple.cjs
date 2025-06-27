const fs = require('fs');
const csv = require('csv-parser');

const videos = [];
const languages = new Set();
const seasons = new Set();
let firstRowKeysLogged = false;

console.log('📹 Processing video CSV with correct columns...');

fs.createReadStream('GROW Video Library Metadata or GROW Video Links Export.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (!firstRowKeysLogged) {
      console.log('CSV columns:', Object.keys(row));
      firstRowKeysLogged = true;
    }
    
    // Use the correct columns
    const name = row['Name'] || '';
    const language = row['Language'] || 'Unknown';
    const title = row['Title'] || 'Untitled';
    const episode = row['Episode'] ? parseInt(row['Episode']) : null;
    let season = null;
    const series = row['Series'] || 'Unknown';
    
    // Try to parse season from the Season column first
    if (row['Season']) {
      const seasonMatch = row['Season'].match(/Season\s*(\d+)/i);
      if (seasonMatch) {
        season = parseInt(seasonMatch[1]);
      }
    }
    
    // If season is still null, try to extract from folder path
    if (season === null && row['Folder Path']) {
      const folderPath = row['Folder Path'];
      const seasonMatch = folderPath.match(/Season\s*(\d+)/i);
      if (seasonMatch) {
        season = parseInt(seasonMatch[1]);
      }
    }
    
    // If episode is null, try to extract from folder path
    let finalEpisode = episode;
    if (finalEpisode === null && row['Folder Path']) {
      const folderPath = row['Folder Path'];
      const episodeMatch = folderPath.match(/Episode\s*(\d+)/i);
      if (episodeMatch) {
        finalEpisode = parseInt(episodeMatch[1]);
      }
    }
    
    // If episode is still null, try to extract from original name
    if (finalEpisode === null && row['Original Name']) {
      const originalName = row['Original Name'];
      const episodeMatch = originalName.match(/Episode\s*(\d+)/i);
      if (episodeMatch) {
        finalEpisode = parseInt(episodeMatch[1]);
      }
    }
    
    // Assign custom thumbnails for Seasons 1, 2, 3 videos based on language
    let thumbnailUrl = null;
    if ([1, 2, 3].includes(season) && series && series.trim().toLowerCase() === 'how to do it series') {
      // Normalize language names to handle variations
      let normalizedLanguage = language;
      if (language.toLowerCase().includes('mandari')) {
        normalizedLanguage = 'Mandarin';
      } else if (language.toLowerCase().includes('portugu')) {
        normalizedLanguage = 'Portuguese';
      } else if (language.toLowerCase().includes('pirtuguese')) {
        normalizedLanguage = 'Portuguese';
      } else if (language.toLowerCase().includes('german') && language !== 'German') {
        normalizedLanguage = 'German';
      } else if (language.toLowerCase().includes('mand') && language !== 'Mandarin') {
        normalizedLanguage = 'Mandarin';
      }
      // Build the expected filename
      const thumbFiles = {
        'Arabic': `HTDI_S${season}_Arabic_8.1.1.png`,
        'French': `HTDI_S${season}_French_8.1.1_8.1.1.png`,
        'German': `HTDI_S${season}_German_8.1.1_8.1.1.png`,
        'Hindi': `HTDI_S${season}_Hindi_8.1.1_8.1.1.png`,
        'Mandarin': `HTDI_S${season}_Mandarin_8.1.1_8.1.2.png`,
        'Portuguese': `HTDI_S${season}_Portugese_8.1.1_8.1.1.png`,
        'Spanish': `HTDI_S${season}_Spanish_8.1.1_8.1.1.png`,
        'Vietnamese': `HTDI_S${season}_Vietnamese_8.1.1_8.1.1.png`
      };
      const thumbnailFile = thumbFiles[normalizedLanguage];
      if (thumbnailFile) {
        thumbnailUrl = `/how-to-thumbnails-languages/${thumbnailFile}`;
      }
    }
    
    const video = {
      id: row['ID'],
      title: title,
      language: language,
      season: season,
      episode: finalEpisode,
      series: series,
      folder_path: row['Folder Path'] || '',
      original_name: row['Original Name'] || name,
      google_drive_file_id: row['ID'],
      preview_link: row['Preview Link'] || '',
      download_link: row['Direct Download Link'] || '',
      mime_type: row['MIME Type'] || 'video/mp4',
      thumbnail_url: thumbnailUrl
    };
    
    videos.push(video);
    languages.add(language);
    if (season !== null) {
      seasons.add(season);
    }
  })
  .on('end', () => {
    console.log(`✅ Processed ${videos.length} videos`);
    console.log(`🌍 Languages found: ${Array.from(languages).sort().join(', ')}`);
    console.log(`📺 Seasons found: ${Array.from(seasons).sort((a, b) => a - b).join(', ')}`);
    
    const metadata = {
      total_videos: videos.length,
      languages: Array.from(languages).sort(),
      seasons: Array.from(seasons).sort((a, b) => a - b)
    };
    
    const output = {
      videos: videos,
      metadata: metadata
    };
    
    fs.writeFileSync('processed-videos.json', JSON.stringify(output, null, 2));
    fs.writeFileSync('processed-videos.csv', 'id,title,language,season,episode,series,folder_path,original_name,google_drive_file_id,preview_link,download_link,mime_type\n');
    
    videos.forEach(video => {
      const csvLine = `${video.id},"${video.title}","${video.language}",${video.season || ''},${video.episode || ''},"${video.series}","${video.folder_path}","${video.original_name}","${video.google_drive_file_id}","${video.preview_link}","${video.download_link}","${video.mime_type}"\n`;
      fs.appendFileSync('processed-videos.csv', csvLine);
    });
    
    console.log('📁 Files created: processed-videos.json, processed-videos.csv');
  }); 