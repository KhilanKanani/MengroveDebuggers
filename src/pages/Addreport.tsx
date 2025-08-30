"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // 🔥 make sure you have this
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Camera, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IncidentReportForm = ({ onReportSubmitted }: { onReportSubmitted?: (report: any) => void }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        photo: null as File | null,
    });
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const { toast } = useToast();

    // ✅ Fetch current user & profile
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                setUserProfile(profile);
            }
        };
        getUser();
    }, []);

    // ✅ Get location
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
                () => {
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

    // ✅ Handle photo
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, photo: e.target.files[0] });
        }
    };

    // ✅ Submit Report
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let photoUrl: string | null = null;

            const { data: uploaded, error: uploadError } = await supabase.storage
                .from("incident-photos") // must match the bucket name you created
                .upload(`reports/${Date.now()}_${formData.photo.name}`, formData.photo);


            // 🔥 Insert report
            const { data: report, error } = await supabase
                .from("mangrove_reports")
                .insert([
                    {
                        title: formData.title,
                        description: formData.description,
                        latitude: location?.lat,
                        longitude: location?.lng,
                        status: "pending",
                        severity: "medium",
                        user_id: user?.id,
                        photos: photoUrl ? [photoUrl] : [],
                    }
                ])
                .select()
                .single();


            if (error) throw error;

            // 🔥 Update profile points
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    points: (userProfile?.points || 0) + 10,
                    total_reports: (userProfile?.total_reports || 0) + 1,
                })
                .eq("user_id", user?.id);

            if (profileError) throw profileError;

            toast({
                title: "Report submitted!",
                description: "Your incident has been submitted. You earned 10 points!",
            });

            // Reset
            setFormData({ title: "", description: "", photo: null });
            setLocation(null);

            if (onReportSubmitted) onReportSubmitted(report);
        } catch (err: any) {
            toast({
                title: "Error submitting report",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto mt-20 shadow-lg border">
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
                            <p className="text-sm text-muted-foreground">Selected: {formData.photo.name}</p>
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

                    <Button type="submit" size="lg" disabled={isLoading || !location} className="w-full">
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
