import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceProviderCardProps {
  id: string;
  name: string;
  email: string;
  contactNumber?: string;
  skills: string[];
  locations: string[];
  rating: number;
}

const ServiceProviderCard = ({
  id,
  name,
  email,
  contactNumber,
  skills,
  locations,
  rating,
}: ServiceProviderCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/provider/${id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{email}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              Service Provider
            </Badge>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contactNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contactNumber}</span>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Locations:</p>
            <div className="flex flex-wrap gap-2">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceProviderCard;
