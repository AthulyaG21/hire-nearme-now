import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Star, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";

const ProviderDetail = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProviderDetail();
  }, [id]);

  const fetchProviderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          *,
          profiles!inner(email, contact_number)
        `)
        .eq("user_id", id)
        .single();

      if (error) throw error;
      setProvider(data);
    } catch (error) {
      console.error("Error fetching provider details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-xl text-muted-foreground">Provider not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{provider.profiles.email}</CardTitle>
                <Badge variant="default">Service Provider</Badge>
              </div>
              {provider.rating > 0 && (
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-lg font-semibold">{provider.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={`mailto:${provider.profiles.email}`}
                  className="text-primary hover:underline"
                >
                  {provider.profiles.email}
                </a>
              </div>

              {provider.profiles.contact_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a 
                    href={`tel:${provider.profiles.contact_number}`}
                    className="text-primary hover:underline"
                  >
                    {provider.profiles.contact_number}
                  </a>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {provider.availability && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability
                </h3>
                <p className="text-muted-foreground">{provider.availability}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-3">Service Locations</h3>
              <div className="space-y-2">
                {provider.locations.map((location: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{location}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button asChild className="flex-1">
                <a href={`mailto:${provider.profiles.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Provider
                </a>
              </Button>
              {provider.profiles.contact_number && (
                <Button asChild variant="outline" className="flex-1">
                  <a href={`tel:${provider.profiles.contact_number}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Provider
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDetail;
