import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MapPin, 
  Plus, 
  TrendingUp, 
  Shield, 
  Award, 
  FileText,
  LogOut,
  Camera,
  AlertTriangle
} from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';

interface Report {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  photos?: string[];
}

interface UserProfile {
  display_name: string;
  user_role: string;
  points: number;
  total_reports: number;
  verified_reports: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchReports();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserProfile(data);
      } else {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user?.id,
            display_name: user?.email?.split('@')[0] || 'Anonymous',
            user_role: 'community_member'
          });
        
        if (insertError) throw insertError;
        
        // Fetch the newly created profile
        fetchUserProfile();
      }
    } catch (error: any) {
      toast.error('Error fetching profile: ' + error.message);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('mangrove_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);

      // Also refresh profile counts
      fetchUserProfile();
    } catch (error: any) {
      toast.error('Error fetching reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-success text-success-foreground';
      case 'investigating': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-primary text-primary-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mangrove Watch
            </h1>
            <Badge variant="outline" className="text-xs">
              {userProfile?.user_role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {userProfile?.display_name || user.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile?.total_reports || 0}</div>
                  <p className="text-xs text-muted-foreground">Your contributions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Reports</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile?.verified_reports || 0}</div>
                  <p className="text-xs text-muted-foreground">Approved by authorities</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile?.points || 0}</div>
                  <p className="text-xs text-muted-foreground">Conservation points</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.length}</div>
                  <p className="text-xs text-muted-foreground">Total community reports</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Latest mangrove incident reports from the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground">{report.incident_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Community Report Map</h2>
                <p className="text-muted-foreground">Visual overview of all mangrove incidents</p>
              </div>
              <Button variant="hero" asChild>
                <a href="/addreport">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Report
                </a>
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <MapboxMap
                  reports={reports.map(r => ({
                    id: r.id,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    title: r.title,
                    incident_type: r.incident_type,
                    severity: r.severity
                  }))}
                  className="w-full h-[600px] rounded-lg"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">All Reports</h2>
                <p className="text-muted-foreground">Community incident reports and their status</p>
              </div>
              <Button variant="hero" asChild>
                <a href="/addreport">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Report
                </a>
              </Button>
            </div>

            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {report.incident_type} • {new Date(report.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                      </div>
                      {report.photos && report.photos.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          <span>{report.photos.length} photo{report.photos.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Your contribution to mangrove conservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Display Name</Label>
                    <p className="text-lg">{userProfile?.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <p className="text-lg capitalize">{userProfile?.user_role?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Conservation Impact</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">{userProfile?.total_reports || 0}</div>
                      <div className="text-sm text-muted-foreground">Reports Submitted</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-success">{userProfile?.verified_reports || 0}</div>
                      <div className="text-sm text-muted-foreground">Reports Verified</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-warning">{userProfile?.points || 0}</div>
                      <div className="text-sm text-muted-foreground">Points Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}