export interface VegetationIndex {
  date: string;
  ndvi: number | null;
  evi: number | null;
  savi: number | null;
  msi: number | null;
}

export async function fetchVegetationIndices({ from, to, geometry }: { from: string; to: string; geometry: any }): Promise<VegetationIndex[]> {
  try {
    const res = await fetch('http://localhost:3001/fetch-vegetation-indices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_start: from + 'T00:00',
        date_end: to + 'T00:00',
        geometry,
        limit: 30
      })
    });
    const data = await res.json();
    if (!data.success && data.error) throw new Error(data.error);
    // Parse indices as in the HTML page
    return (data.data || []).map((scene: any) => {
      if (scene.indexes && scene.indexes.NDVI && scene.indexes.EVI && scene.indexes.SAVI) {
        return {
          date: scene.date,
          ndvi: scene.indexes.NDVI.average,
          evi: scene.indexes.EVI.average,
          savi: scene.indexes.SAVI.average,
          msi: 0.5 // Placeholder if not available
        };
      }
      if (scene.indexes && scene.indexes.B04 && scene.indexes.B08) {
        const b04 = scene.indexes.B04.average;
        const b08 = scene.indexes.B08.average;
        // Calculate indices as fallback
        const ndvi = (b08 - b04) / (b08 + b04);
        const evi = 2.5 * (b08 - b04) / (b08 + 6 * b04 + 1);
        const savi = 1.5 * (b08 - b04) / (b08 + b04 + 0.5);
        const msi = 1 - (b04 / b08);
        return { date: scene.date, ndvi, evi, savi, msi };
      }
      return { date: scene.date, ndvi: null, evi: null, savi: null, msi: null };
    }).filter((item: VegetationIndex) => item.ndvi !== null)
      .sort((a: VegetationIndex, b: VegetationIndex) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (e) {
    console.error('Error fetching vegetation indices:', e);
    throw e;
  }
} 