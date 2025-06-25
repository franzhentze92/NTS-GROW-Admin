import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, FeatureGroup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Fix for Leaflet default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Plot {
  id: string;
  name: string;
  geojson: any;
  treatment?: string;
  repetition?: string;
  plotNumber?: string;
}

interface Treatment {
  id: string;
  name: string;
  color: string;
}

interface FieldDesignerProps {
  trialId: string;
  onSave: (design: any) => void;
}

const treatments: Treatment[] = [
  { id: '1', name: 'Control', color: '#6b7280' },
  { id: '2', name: 'Fertilizer A', color: '#10b981' },
  { id: '3', name: 'Fertilizer B', color: '#3b82f6' },
  { id: '4', name: 'Irrigation A', color: '#f59e0b' },
  { id: '5', name: 'Irrigation B', color: '#8b5cf6' },
];

const basemaps = [
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
  },
];

// Component to handle drawing controls
const DrawingControls: React.FC<{
  plots: Plot[];
  onPlotCreated: (plot: Plot) => void;
  onPlotEdited: (plots: Plot[]) => void;
  onPlotDeleted: (plotIds: string[]) => void;
}> = ({ plots, onPlotCreated, onPlotEdited, onPlotDeleted }) => {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup>();
  const drawControlRef = useRef<any>();

  useEffect(() => {
    if (!map) return;

    // Create feature group for drawn items
    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    // Initialize draw control with type assertion
    drawControlRef.current = new (L.Control as any).Draw({
      position: 'topright',
      draw: {
        rectangle: true,
        polygon: true,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true,
      },
    });

    map.addControl(drawControlRef.current);

    // Handle drawing events
    const handleDrawCreated = (e: any) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const id = Date.now().toString();
      
      const newPlot: Plot = {
        id,
        name: `Plot ${plots.length + 1}`,
        geojson,
        plotNumber: `P${String(plots.length + 1).padStart(2, '0')}`
      };
      
      // Store the layer reference for later use
      (layer as any).plotId = id;
      
      onPlotCreated(newPlot);
      
      // Remove the drawn layer from map (we'll add it back with proper styling)
      featureGroupRef.current?.removeLayer(layer);
    };

    const handleDrawEdited = (e: any) => {
      const layers = e.layers;
      const updated: Plot[] = [...plots];
      
      layers.eachLayer((layer: any) => {
        const geojson = layer.toGeoJSON();
        const plotId = layer.plotId;
        const found = updated.find((p) => p.id === plotId);
        if (found) {
          found.geojson = geojson;
        }
      });
      
      onPlotEdited(updated);
    };

    const handleDrawDeleted = (e: any) => {
      const layers = e.layers;
      const idsToDelete: string[] = [];
      
      layers.eachLayer((layer: any) => {
        const plotId = layer.plotId;
        if (plotId) {
          idsToDelete.push(plotId);
        }
      });
      
      onPlotDeleted(idsToDelete);
    };

    // Use type assertion for Draw events
    map.on((L as any).Draw.Event.CREATED, handleDrawCreated);
    map.on((L as any).Draw.Event.EDITED, handleDrawEdited);
    map.on((L as any).Draw.Event.DELETED, handleDrawDeleted);

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
      }
      map.off((L as any).Draw.Event.CREATED, handleDrawCreated);
      map.off((L as any).Draw.Event.EDITED, handleDrawEdited);
      map.off((L as any).Draw.Event.DELETED, handleDrawDeleted);
    };
  }, [map, plots.length, onPlotCreated, onPlotEdited, onPlotDeleted]);

  return null;
};

const FieldDesigner: React.FC<FieldDesignerProps> = ({ trialId, onSave }) => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotTreatment, setNewPlotTreatment] = useState('');
  const [newPlotRepetition, setNewPlotRepetition] = useState('');
  const [newPlotNumber, setNewPlotNumber] = useState('');
  const [tempPlot, setTempPlot] = useState<Plot | null>(null);
  const [fieldBoundary, setFieldBoundary] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState('');
  const [selectedBasemap, setSelectedBasemap] = useState('satellite');
  const [measuring, setMeasuring] = useState(false);
  const [measureResult, setMeasureResult] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);
  const measureLayerRef = useRef<any>(null);
  const [plotLayoutType, setPlotLayoutType] = useState<'grid' | 'strip'>('grid');
  const [numRows, setNumRows] = useState(4);
  const [numCols, setNumCols] = useState(4);
  const [numStrips, setNumStrips] = useState(4);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  // Handle creation of new plots
  const handlePlotCreated = (plot: Plot) => {
    setTempPlot(plot);
    setNewPlotName(plot.name);
    setNewPlotNumber(plot.plotNumber || '');
    setShowDialog(true);
  };

  // Handle editing of plots
  const handlePlotEdited = (updatedPlots: Plot[]) => {
    setPlots(updatedPlots);
  };

  // Handle deletion of plots
  const handlePlotDeleted = (plotIds: string[]) => {
    setPlots((prev) => prev.filter((p) => !plotIds.includes(p.id)));
    if (selectedPlot && plotIds.includes(selectedPlot.id)) {
      setSelectedPlot(null);
    }
  };

  // Save plot details from dialog
  const handleSavePlot = () => {
    if (tempPlot) {
      const updatedPlot = {
        ...tempPlot,
        name: newPlotName,
        treatment: newPlotTreatment,
        repetition: newPlotRepetition,
        plotNumber: newPlotNumber
      };
      
      setPlots([...plots, updatedPlot]);
      setTempPlot(null);
      setShowDialog(false);
      setNewPlotName('');
      setNewPlotTreatment('');
      setNewPlotRepetition('');
      setNewPlotNumber('');
    }
  };

  // Handle plot selection
  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
  };

  // Export to EOSDA format
  const handleSaveDesign = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: plots.map((plot) => ({
        type: 'Feature',
        geometry: plot.geojson.geometry,
        properties: {
          id: plot.id,
          name: plot.name,
          treatment: plot.treatment,
          repetition: plot.repetition,
          plotNumber: plot.plotNumber,
          trialId: trialId
        }
      }))
    };
    
    onSave(geojson);
  };

  // Auto-number plots
  const handleAutoNumber = () => {
    const updatedPlots = plots.map((plot, index) => ({
      ...plot,
      plotNumber: `P${String(index + 1).padStart(2, '0')}`
    }));
    setPlots(updatedPlots);
  };

  // Randomize treatments
  const handleRandomize = () => {
    const treatmentIds = treatments.map(t => t.id);
    const shuffled = [...treatmentIds].sort(() => Math.random() - 0.5);
    
    const updatedPlots = plots.map((plot, index) => ({
      ...plot,
      treatment: shuffled[index % shuffled.length]
    }));
    
    setPlots(updatedPlots);
  };

  // Drawing controls for field boundary
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous controls
    map.eachLayer((layer: any) => {
      if (layer instanceof L.FeatureGroup && layer !== featureGroupRef.current) {
        map.removeLayer(layer);
      }
    });

    // Add drawing controls for field boundary
    const drawControl = new (L.Control as any).Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: '#10b981', weight: 3 },
        },
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // Draw event handlers
    const handleCreated = (e: any) => {
      if (e.layerType === 'polygon') {
        setFieldBoundary(e.layer.toGeoJSON());
        featureGroupRef.current.clearLayers();
        featureGroupRef.current.addLayer(e.layer);
      }
    };
    const handleEdited = (e: any) => {
      e.layers.eachLayer((layer: any) => {
        setFieldBoundary(layer.toGeoJSON());
      });
    };
    const handleDeleted = (e: any) => {
      setFieldBoundary(null);
      featureGroupRef.current.clearLayers();
    };
    map.on((L as any).Draw.Event.CREATED, handleCreated);
    map.on((L as any).Draw.Event.EDITED, handleEdited);
    map.on((L as any).Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off((L as any).Draw.Event.CREATED, handleCreated);
      map.off((L as any).Draw.Event.EDITED, handleEdited);
      map.off((L as any).Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
    };
  }, [mapRef.current]);

  // Measurement tool
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !measuring) return;
    let measureLayer: any = null;
    let startLatLng: any = null;
    let tempLine: any = null;
    let tempPolygon: any = null;
    let points: any[] = [];

    const onClick = (e: any) => {
      if (!startLatLng) {
        startLatLng = e.latlng;
        points.push(e.latlng);
        tempLine = L.polyline([e.latlng], { color: '#3b82f6', weight: 3 }).addTo(map);
      } else {
        points.push(e.latlng);
        tempLine.addLatLng(e.latlng);
        if (points.length > 2) {
          if (tempPolygon) map.removeLayer(tempPolygon);
          tempPolygon = L.polygon(points, { color: '#f59e0b', weight: 2, fillOpacity: 0.1 }).addTo(map);
        }
      }
    };
    const onDblClick = () => {
      if (points.length > 1) {
        if (tempPolygon) {
          const area = L.GeometryUtil.geodesicArea(tempPolygon.getLatLngs()[0]);
          setMeasureResult(`Area: ${(area / 10000).toFixed(2)} ha`);
        } else if (tempLine) {
          const latlngs = tempLine.getLatLngs();
          let dist = 0;
          for (let i = 1; i < latlngs.length; i++) {
            dist += latlngs[i - 1].distanceTo(latlngs[i]);
          }
          setMeasureResult(`Distance: ${(dist / 1000).toFixed(2)} km`);
        }
      }
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      setMeasuring(false);
    };
    map.on('click', onClick);
    map.on('dblclick', onDblClick);
    return () => {
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      if (tempLine) map.removeLayer(tempLine);
      if (tempPolygon) map.removeLayer(tempPolygon);
    };
  }, [measuring]);

  // Import field boundary from GeoJSON
  const handleImportGeoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);
        setFieldBoundary(geojson);
        setShowImportDialog(false);
        setImportError('');
      } catch (err) {
        setImportError('Invalid GeoJSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Export field boundary as GeoJSON
  const handleExportGeoJSON = () => {
    if (!fieldBoundary) return;
    const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fieldBoundary));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'field-boundary.geojson');
    dlAnchorElem.click();
  };

  // Map center
  const mapCenter = fieldBoundary?.geometry?.coordinates?.[0]?.[0]
    ? [fieldBoundary.geometry.coordinates[0][0][1], fieldBoundary.geometry.coordinates[0][0][0]]
    : [40.7128, -74.006];

  // Generate grid plots within the field boundary
  const handleGeneratePlots = () => {
    if (!fieldBoundary) return;
    // Only support rectangular boundaries for now (first ring of polygon)
    const coords = fieldBoundary.geometry.coordinates[0];
    if (coords.length < 4) return;
    // Get bounding box
    const lats = coords.map((c: any) => c[1]);
    const lngs = coords.map((c: any) => c[0]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const plotsArr: Plot[] = [];
    if (plotLayoutType === 'grid') {
      const dLat = (maxLat - minLat) / numRows;
      const dLng = (maxLng - minLng) / numCols;
      let plotNum = 1;
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const poly = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [minLng + c * dLng, minLat + r * dLat],
                [minLng + (c + 1) * dLng, minLat + r * dLat],
                [minLng + (c + 1) * dLng, minLat + (r + 1) * dLat],
                [minLng + c * dLng, minLat + (r + 1) * dLat],
                [minLng + c * dLng, minLat + r * dLat],
              ]],
            },
            properties: {},
          };
          plotsArr.push({
            id: `plot-${plotNum}`,
            name: `Plot ${plotNum}`,
            geojson: poly,
            plotNumber: `P${plotNum}`,
          });
          plotNum++;
        }
      }
    } else if (plotLayoutType === 'strip') {
      // Vertical strips
      const dLng = (maxLng - minLng) / numStrips;
      let plotNum = 1;
      for (let s = 0; s < numStrips; s++) {
        const poly = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [minLng + s * dLng, minLat],
              [minLng + (s + 1) * dLng, minLat],
              [minLng + (s + 1) * dLng, maxLat],
              [minLng + s * dLng, maxLat],
              [minLng + s * dLng, minLat],
            ]],
          },
          properties: {},
        };
        plotsArr.push({
          id: `plot-${plotNum}`,
          name: `Strip ${plotNum}`,
          geojson: poly,
          plotNumber: `S${plotNum}`,
        });
        plotNum++;
      }
    }
    setPlots(plotsArr);
  };

  useEffect(() => {
    if (mapRef.current && !featureGroupRef.current) {
      featureGroupRef.current = new L.FeatureGroup();
      mapRef.current.addLayer(featureGroupRef.current);
    }
  }, [mapRef.current]);

  return (
    <div className="flex h-[80vh]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r p-4 flex flex-col gap-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Field Boundary</CardTitle>
            <CardDescription>Draw or import your field boundary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-1" /> Import GeoJSON
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportGeoJSON} disabled={!fieldBoundary}>
                Export GeoJSON
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              {fieldBoundary ? 'Boundary set.' : 'No boundary drawn or imported.'}
            </div>
            {measureResult && <div className="mt-2 text-green-700 font-medium">{measureResult}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generate Plots</CardTitle>
            <CardDescription>Auto-generate grid or strip plots within your field boundary</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={plotLayoutType} onValueChange={v => setPlotLayoutType(v as 'grid' | 'strip')} className="mb-2">
              <RadioGroupItem value="grid" id="grid" /> <Label htmlFor="grid">Grid</Label>
              <RadioGroupItem value="strip" id="strip" className="ml-4" /> <Label htmlFor="strip">Strip</Label>
            </RadioGroup>
            {plotLayoutType === 'grid' ? (
              <div className="flex gap-2 mb-2">
                <div>
                  <Label>Rows</Label>
                  <Input type="number" min={1} max={20} value={numRows} onChange={e => setNumRows(Number(e.target.value))} className="w-16" />
                </div>
                <div>
                  <Label>Columns</Label>
                  <Input type="number" min={1} max={20} value={numCols} onChange={e => setNumCols(Number(e.target.value))} className="w-16" />
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <Label>Strips</Label>
                <Input type="number" min={1} max={20} value={numStrips} onChange={e => setNumStrips(Number(e.target.value))} className="w-16" />
              </div>
            )}
            <Button size="sm" className="mt-2 w-full" onClick={handleGeneratePlots} disabled={!fieldBoundary}>
              Generate Plots
            </Button>
            <div className="text-xs text-gray-500 mt-2">{plots.length > 0 ? `${plots.length} plots generated` : 'No plots generated yet.'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant={measuring ? 'default' : 'outline'} onClick={() => { setMeasuring(true); setMeasureResult(null); }}>Measure</Button>
              <Select value={selectedBasemap} onValueChange={setSelectedBasemap}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Basemap" />
                </SelectTrigger>
                <SelectContent>
                  {basemaps.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          {/* Basemap layers */}
          {basemaps.map(b => (
            <TileLayer
              key={b.id}
              url={b.url}
              attribution={b.attribution}
              opacity={b.id === selectedBasemap ? 1 : 0}
              zIndex={b.id === selectedBasemap ? 1 : 0}
            />
          ))}
          {/* Field boundary GeoJSON */}
          {fieldBoundary && <GeoJSON data={fieldBoundary} style={{ color: '#10b981', weight: 3, fillOpacity: 0.1 }} />}
          {/* Render generated plots */}
          {plots.map(plot => (
            <GeoJSON
              key={plot.id}
              data={plot.geojson}
              style={{ color: selectedPlotId === plot.id ? '#3b82f6' : '#6366f1', weight: 2, fillOpacity: 0.2 }}
              eventHandlers={{ click: () => setSelectedPlotId(plot.id) }}
            />
          ))}
        </MapContainer>
      </div>
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Field Boundary (GeoJSON)</DialogTitle>
            <DialogDescription>Upload a GeoJSON file containing your field boundary polygon.</DialogDescription>
          </DialogHeader>
          <Input type="file" accept=".geojson,application/geo+json,application/json" onChange={handleImportGeoJSON} />
          {importError && <div className="text-red-600 text-sm mt-2">{importError}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldDesigner; 