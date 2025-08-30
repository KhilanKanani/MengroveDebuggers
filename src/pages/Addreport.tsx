import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Camera, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photo: null as File | null,
  });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
          toast({
            title: "Location captured!",
            description: "Your current location has been captured successfully.",
          });
        },
        (error) => {
          setLocationLoading(false);
          toast({
            title: "Location error",
            description: "Could not capture your location. Please try again.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Report submitted!",
        description: "Your incident report has been submitted successfully. You earned 10 points!",
      });

      // Reset form
      setFormData({ title: "", description: "", photo: null });
      setLocation(null);
    }, 2000);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-6 w-6 text-primary" />
          <span>Report Mangrove Incident</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Illegal dumping near mangroves"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you observed..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo Evidence</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer"
            />
            {formData.photo && (
              <p className="text-sm text-muted-foreground">
                Selected: {formData.photo.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={getLocation}
                disabled={locationLoading}
                className="flex items-center space-x-2"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>Capture Location</span>
              </Button>
              {location && (
                <span className="text-sm text-muted-foreground">
                  📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !location}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report (+10 points)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentReportForm;