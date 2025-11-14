import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockTrains = [
  {
    id: "1",
    name: "Express Metro",
    number: "12001",
    departure: "06:00 AM",
    arrival: "02:00 PM",
    duration: "8h 0m",
    availableSeats: 45,
    price: 850,
    class: "AC 2-Tier",
  },
  {
    id: "2",
    name: "Shatabdi Express",
    number: "12002",
    departure: "08:30 AM",
    arrival: "04:15 PM",
    duration: "7h 45m",
    availableSeats: 12,
    price: 1200,
    class: "AC Chair Car",
  },
  {
    id: "3",
    name: "Rajdhani Express",
    number: "12003",
    departure: "10:00 AM",
    arrival: "05:30 PM",
    duration: "7h 30m",
    availableSeats: 28,
    price: 1450,
    class: "AC 1-Tier",
  },
  {
    id: "4",
    name: "Duronto Express",
    number: "12004",
    departure: "02:00 PM",
    arrival: "10:00 PM",
    duration: "8h 0m",
    availableSeats: 67,
    price: 750,
    class: "Sleeper",
  },
];

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || { from: "Delhi", to: "Mumbai", date: "2024-03-20" };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          {/* Search Summary */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-primary" />
                  {searchData.from}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-secondary" />
                  {searchData.to}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {searchData.date}
              </div>
            </div>
          </Card>

          {/* Results Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Available Trains</h2>
            <p className="text-muted-foreground">
              {mockTrains.length} trains found for your journey
            </p>
          </div>

          {/* Train Cards */}
          <div className="space-y-4">
            {mockTrains.map((train) => (
              <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Train Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{train.name}</h3>
                      <p className="text-muted-foreground">Train #{train.number}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Departure</p>
                        <p className="text-lg font-semibold">{train.departure}</p>
                      </div>
                      <div className="hidden sm:block text-muted-foreground">→</div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival</p>
                        <p className="text-lg font-semibold">{train.arrival}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold">{train.duration}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{train.class}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {train.availableSeats} seats
                      </Badge>
                    </div>
                  </div>

                  {/* Price & Booking */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-3xl font-bold text-primary">₹{train.price}</p>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-secondary w-full sm:w-auto"
                      onClick={() => navigate(`/seat-selection/${train.id}`, { state: { train, searchData } })}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
