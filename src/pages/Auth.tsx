import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navbar from "@/components/Navbar";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<"service_provider" | "service_seeker">("service_seeker");
  const [contactNumber, setContactNumber] = useState("");
  const [place, setPlace] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      
      if (role === "service_provider") {
        if (skills.length === 0) {
          throw new Error("Please add at least one skill");
        }
        if (locations.length === 0) {
          throw new Error("Please add at least one location");
        }
      } else {
        if (!place.trim()) {
          throw new Error("Please enter your location");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      } else if (error instanceof Error) {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    const metadata: any = {
      role,
      contact_number: contactNumber,
    };

    if (role === "service_provider") {
      metadata.skills = JSON.stringify(skills);
      metadata.locations = JSON.stringify(locations);
      metadata.availability = availability;
    } else {
      metadata.place = place;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! You can now login.",
      });
      navigate("/");
    }
    setLoading(false);
  };

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addLocation = () => {
    if (currentLocation.trim() && !locations.includes(currentLocation.trim())) {
      setLocations([...locations, currentLocation.trim()]);
      setCurrentLocation("");
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setLocations(locations.filter(location => location !== locationToRemove));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Login or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="service_seeker" id="seeker" />
                        <Label htmlFor="seeker">Service Seeker</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="service_provider" id="provider" />
                        <Label htmlFor="provider">Service Provider</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>

                  {role === "service_provider" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="skill">Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            id="skill"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            placeholder="Add a skill"
                          />
                          <Button type="button" onClick={addSkill}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability (Optional)</Label>
                        <Input
                          id="availability"
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          placeholder="e.g., Mon-Fri 9AM-5PM"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Service Locations</Label>
                        <div className="flex gap-2">
                          <Input
                            id="location"
                            value={currentLocation}
                            onChange={(e) => setCurrentLocation(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                            placeholder="Add a location"
                          />
                          <Button type="button" onClick={addLocation}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {locations.map((location, index) => (
                            <Badge key={index} variant="secondary">
                              {location}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => removeLocation(location)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="place">Your Location</Label>
                      <Input
                        id="place"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
