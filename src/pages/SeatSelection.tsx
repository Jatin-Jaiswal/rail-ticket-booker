import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Seat {
  id: string;
  seat_number: string;
  is_available: boolean;
  locked_until: string | null;
  locked_by: string | null;
}

const SeatSelection = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const trainData = location.state?.train;
  const searchData = location.state?.searchData;

  useEffect(() => {
    if (!trainId) return;
    fetchSeats();
  }, [trainId]);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .eq("train_id", trainId)
        .order("seat_number");

      if (error) throw error;
      setSeats(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load seats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 4) {
        toast({
          title: "Maximum Seats",
          description: "You can select maximum 4 seats per booking",
          variant: "destructive",
        });
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat",
        variant: "destructive",
      });
      return;
    }

    navigate("/checkout", {
      state: {
        train: trainData,
        searchData,
        selectedSeats,
        totalAmount: (trainData?.price || 850) * selectedSeats.length,
      },
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
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>

          {/* Train Info */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{trainData?.name || "Express Metro"}</h2>
                <p className="text-muted-foreground">Train #{trainData?.number || "12001"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{trainData?.class || "AC 2-Tier"}</Badge>
                <Badge variant="outline">
                  {searchData?.from || "Delhi"} → {searchData?.to || "Mumbai"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Seat Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Select Your Seats</h3>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 border-border bg-background"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 border-primary bg-primary/20"></div>
                    <span className="text-sm">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 border-border bg-muted"></div>
                    <span className="text-sm">Booked</span>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="grid grid-cols-6 gap-3">
                  {seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seat_number);
                    const isBooked = !seat.is_available;
                    const isLocked = seat.locked_until && new Date(seat.locked_until) > new Date() && seat.locked_by !== user?.id;

                    return (
                      <button
                        key={seat.id}
                        onClick={() => !isBooked && !isLocked && toggleSeat(seat.seat_number)}
                        disabled={isBooked || isLocked}
                        className={`
                          aspect-square rounded border-2 transition-all font-medium text-sm
                          ${isSelected ? "border-primary bg-primary/20" : "border-border bg-background"}
                          ${isBooked || isLocked ? "bg-muted cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-primary/10"}
                        `}
                      >
                        {isSelected && <Check className="h-4 w-4 mx-auto text-primary" />}
                        <span className="text-xs">{seat.seat_number}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Seats:</span>
                    <span className="font-medium">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per Seat:</span>
                    <span className="font-medium">₹{trainData?.price || 850}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of Seats:</span>
                    <span className="font-medium">{selectedSeats.length}</span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{(trainData?.price || 850) * selectedSeats.length}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeatSelection;
