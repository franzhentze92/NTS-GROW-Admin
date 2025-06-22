import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CropHealth from "../components/satellite/CropHealth";
import Weather from "../components/satellite/Weather";

const SatelliteImageryPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Satellite Imagery</h1>
      <Tabs defaultValue="crop-health">
        <TabsList>
          <TabsTrigger value="crop-health">Crop Health</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
        </TabsList>
        <TabsContent value="crop-health">
          <CropHealth />
        </TabsContent>
        <TabsContent value="weather">
          <Weather />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SatelliteImageryPage;
