import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  duration_hours: number;
  available_seats: number;
  class_type: string;
  price_per_seat: number;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchData = location.state || { from: "Delhi", to: "Mumbai", date: new Date().toISOString().split('T')[0] };
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .eq("active", true)
        .order("departure_time");

      if (error) throw error;
      
      // Filter by source and destination if provided
      let filteredData = data || [];
      if (searchData.from && searchData.to) {
        filteredData = filteredData.filter(
          (train) =>
            train.source_station.toLowerCase().includes(searchData.from.toLowerCase()) &&
            train.destination_station.toLowerCase().includes(searchData.to.toLowerCase())
        );
      }

      setTrains(filteredData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trains",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

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
              {trains.length} train{trains.length !== 1 ? 's' : ''} found for your journey
            </p>
          </div>

          {trains.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No trains found for the selected route
              </p>
              <Button onClick={() => navigate("/")}>
                Search Again
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {trains.map((train) => (
                <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Train Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{train.train_name}</h3>
                        <p className="text-muted-foreground">Train #{train.train_number}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div>
                          <p className="text-sm text-muted-foreground">Departure</p>
                          <p className="text-lg font-semibold">{formatTime(train.departure_time)}</p>
                        </div>
                        <div className="hidden sm:block text-muted-foreground">→</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Arrival</p>
                          <p className="text-lg font-semibold">{formatTime(train.arrival_time)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-lg font-semibold">{train.duration_hours}h</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{train.class_type}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {train.available_seats} seats
                        </Badge>
                      </div>
                    </div>

                    {/* Price & Booking */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Starting from</p>
                        <p className="text-3xl font-bold text-primary">₹{train.price_per_seat}</p>
                      </div>
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-secondary w-full sm:w-auto"
                        onClick={() => navigate(`/seat-selection/${train.id}`, { 
                          state: { 
                            train: { 
                              ...train, 
                              name: train.train_name, 
                              number: train.train_number, 
                              price: train.price_per_seat,
                              class: train.class_type,
                              departure: formatTime(train.departure_time),
                              arrival: formatTime(train.arrival_time),
                              duration: `${train.duration_hours}h`,
                              availableSeats: train.available_seats
                            }, 
                            searchData 
                          } 
                        })}
                        disabled={train.available_seats === 0}
                      >
                        {train.available_seats === 0 ? "Sold Out" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
