const fs = require('fs');

// Read the processed video data
const videoData = JSON.parse(fs.readFileSync('processed-videos.json', 'utf8'));
const videos = videoData.videos;

console.log('📊 VIDEO LIBRARY ANALYSIS');
console.log('========================\n');

// Basic statistics
console.log(`Total videos processed: ${videos.length}`);
console.log(`Languages available: ${videoData.metadata.languages.join(', ')}`);
console.log(`Seasons available: ${videoData.metadata.seasons.join(', ')}`);

// Videos with complete metadata
const completeVideos = videos.filter(v => v.season !== null && v.episode !== null);
const incompleteVideos = videos.filter(v => v.season === null || v.episode === null);

console.log(`\n✅ Videos with complete metadata: ${completeVideos.length}`);
console.log(`❌ Videos with incomplete metadata: ${incompleteVideos.length}`);

// Breakdown by season
console.log('\n📺 BREAKDOWN BY SEASON:');
const seasonBreakdown = {};
videos.forEach(video => {
  const season = video.season || 'Unknown';
  if (!seasonBreakdown[season]) {
    seasonBreakdown[season] = { count: 0, languages: new Set() };
  }
  seasonBreakdown[season].count++;
  seasonBreakdown[season].languages.add(video.language);
});

Object.keys(seasonBreakdown).sort().forEach(season => {
  const data = seasonBreakdown[season];
  console.log(`  Season ${season}: ${data.count} videos (${Array.from(data.languages).join(', ')})`);
});

// Breakdown by language
console.log('\n🌍 BREAKDOWN BY LANGUAGE:');
const languageBreakdown = {};
videos.forEach(video => {
  const lang = video.language;
  if (!languageBreakdown[lang]) {
    languageBreakdown[lang] = { count: 0, seasons: new Set() };
  }
  languageBreakdown[lang].count++;
  languageBreakdown[lang].seasons.add(video.season || 'Unknown');
});

Object.keys(languageBreakdown).sort().forEach(lang => {
  const data = languageBreakdown[lang];
  console.log(`  ${lang}: ${data.count} videos (Seasons: ${Array.from(data.seasons).join(', ')})`);
});

// Show incomplete videos
if (incompleteVideos.length > 0) {
  console.log('\n❌ VIDEOS WITH INCOMPLETE METADATA:');
  console.log('These videos don\'t have season/episode information:');
  
  // Group by folder path to see patterns
  const incompleteByFolder = {};
  incompleteVideos.forEach(video => {
    const folder = video.folder_path || 'Unknown Folder';
    if (!incompleteByFolder[folder]) {
      incompleteByFolder[folder] = [];
    }
    incompleteByFolder[folder].push(video);
  });
  
  Object.keys(incompleteByFolder).forEach(folder => {
    const videos = incompleteByFolder[folder];
    console.log(`\n  📁 ${folder} (${videos.length} videos):`);
    videos.slice(0, 3).forEach(video => {
      console.log(`    - ${video.original_name} (${video.language})`);
    });
    if (videos.length > 3) {
      console.log(`    ... and ${videos.length - 3} more`);
    }
  });
}

// Show sample of complete videos
console.log('\n✅ SAMPLE OF COMPLETE VIDEOS:');
completeVideos.slice(0, 10).forEach(video => {
  console.log(`  S${video.season}E${video.episode}: ${video.title} (${video.language})`);
});

// Check for potential issues
console.log('\n🔍 POTENTIAL ISSUES:');
const issues = [];

// Check for videos with empty titles
const emptyTitles = videos.filter(v => !v.title || v.title.trim() === '');
if (emptyTitles.length > 0) {
  issues.push(`${emptyTitles.length} videos with empty titles`);
}

// Check for videos with missing Google Drive IDs
const missingDriveIds = videos.filter(v => !v.google_drive_file_id);
if (missingDriveIds.length > 0) {
  issues.push(`${missingDriveIds.length} videos with missing Google Drive IDs`);
}

// Check for duplicate titles
const titleCounts = {};
videos.forEach(v => {
  const title = v.title;
  titleCounts[title] = (titleCounts[title] || 0) + 1;
});
const duplicates = Object.entries(titleCounts).filter(([title, count]) => count > 1);
if (duplicates.length > 0) {
  issues.push(`${duplicates.length} duplicate titles found`);
}

if (issues.length === 0) {
  console.log('  No issues found! 🎉');
} else {
  issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
}

// Summary for frontend
console.log('\n📱 FRONTEND DISPLAY SUMMARY:');
console.log(`  • Total videos that will be displayed: ${videos.length}`);
console.log(`  • Videos with proper season/episode: ${completeVideos.length}`);
console.log(`  • Videos with "S?E?" display: ${incompleteVideos.length}`);
console.log(`  • Available filter options:`);
console.log(`    - Seasons: ${Object.keys(seasonBreakdown).filter(s => s !== 'Unknown').join(', ')}`);
console.log(`    - Languages: ${Object.keys(languageBreakdown).join(', ')}`);

console.log('\n✨ Analysis complete!'); 