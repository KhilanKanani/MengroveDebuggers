import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  MapPin, 
  Camera, 
  Award, 
  TrendingUp,
  Heart,
  Leaf,
  Fish,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-mangrove.jpg';
import mangroveIcon from '@/assets/mangrove-icon.jpg';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Camera,
      title: "Report Incidents",
      description: "Easily document mangrove threats with photos and location data"
    },
    {
      icon: MapPin,
      title: "Real-time Mapping",
      description: "View all community reports on an interactive map"
    },
    {
      icon: Shield,
      title: "Authority Dashboard",
      description: "Government and NGO tools for monitoring and response"
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Earn points and badges for verified conservation reports"
    }
  ];

  const userRoles = [
    {
      icon: Users,
      title: "Community Members",
      description: "Local residents protecting their coastal environment",
      color: "text-primary"
    },
    {
      icon: Fish,
      title: "Fishermen",
      description: "Traditional knowledge keepers of coastal ecosystems",
      color: "text-secondary"
    },
    {
      icon: Building2,
      title: "Government Authorities",
      description: "Forest officials and environmental agencies",
      color: "text-success"
    },
    {
      icon: Heart,
      title: "NGOs",
      description: "Conservation organizations and environmental groups",
      color: "text-warning"
    },
    {
      icon: GraduationCap,
      title: "Researchers",
      description: "Scientists studying mangrove ecosystems",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={mangroveIcon} alt="Mangrove Watch" className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mangrove Watch
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="hero" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/80"></div>
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Leaf className="h-4 w-4 mr-2" />
              Community-Powered Conservation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Protecting Mangroves
              <br />
              <span className="bg-gradient-to-r from-white to-secondary-light bg-clip-text text-transparent">
                Together
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Join the global community monitoring and protecting vital mangrove ecosystems through 
              participatory reporting and real-time data sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="xl" variant="hero" asChild>
                <Link to="/auth">Start Reporting</Link>
              </Button>
              <Button size="xl" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to="/dashboard">View Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empowering Conservation Through Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines community knowledge with modern technology to create 
              a comprehensive mangrove monitoring system.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-elevated transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-24 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Stakeholder
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a local community member, researcher, or government official, 
              our platform serves your conservation needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRoles.map((role, index) => (
              <Card key={index} className="group hover:shadow-primary transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${role.color}`}>
                      <role.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Making a Real Impact
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of conservation champions protecting our planet's critical ecosystems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-white/80">Countries</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-white/80">Community Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">25K+</div>
              <div className="text-white/80">Reports Submitted</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-white/80">Hectares Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our growing community of mangrove guardians and help protect these 
              vital ecosystems for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="xl" variant="hero" asChild>
                <Link to="/auth">Join the Community</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/dashboard">Explore Reports</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={mangroveIcon} alt="Mangrove Watch" className="h-8 w-8 rounded-full" />
            <span className="font-semibold">Mangrove Watch</span>
          </div>
          <p>© 2025 Mangrove Watch. Protecting coastal ecosystems through community action.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
