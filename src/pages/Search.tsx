import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ServiceProviderCard from "@/components/ServiceProviderCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  
  const query = searchParams.get("q") || "";

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
    fetchProviders();
  }, [query]);

  useEffect(() => {
    filterByLocation();
  }, [locationFilter, providers]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          *,
          profiles!inner(email, contact_number)
        `);

      if (error) throw error;

      // Filter by skill if query exists
      const filtered = query
        ? data.filter((provider) =>
            provider.skills.some((skill: string) =>
              skill.toLowerCase().includes(query.toLowerCase())
            )
          )
        : data;

      setProviders(filtered);
      setFilteredProviders(filtered);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByLocation = () => {
    if (!locationFilter.trim()) {
      setFilteredProviders(providers);
      return;
    }

    const filtered = providers.filter((provider) =>
      provider.locations.some((loc: string) =>
        loc.toLowerCase().includes(locationFilter.toLowerCase())
      )
    );
    setFilteredProviders(filtered);
  };

  const handleSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-6">
          <Label htmlFor="location-filter">Filter by Location</Label>
          <Input
            id="location-filter"
            placeholder="Enter location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="max-w-md"
          />
        </div>

        {query && (
          <h2 className="text-2xl font-bold mb-6">
            Results for "{query}" {locationFilter && `in ${locationFilter}`}
          </h2>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No service providers found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ServiceProviderCard
                key={provider.id}
                id={provider.user_id}
                name={provider.profiles.email}
                email={provider.profiles.email}
                contactNumber={provider.profiles.contact_number}
                skills={provider.skills}
                locations={provider.locations}
                rating={provider.rating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
