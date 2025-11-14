import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const passengerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.number().min(1, "Age must be valid").max(120),
  gender: z.enum(["male", "female", "other"]),
});

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { train, searchData, selectedSeats, totalAmount } = location.state || {};

  const [passengerData, setPassengerData] = useState({
    name: "",
    age: "",
    gender: "male",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleBooking = async () => {
    try {
      // Validate passenger data
      const validated = passengerSchema.parse({
        ...passengerData,
        age: parseInt(passengerData.age),
      });

      setLoading(true);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user?.id,
          train_id: train.id,
          booking_date: new Date().toISOString().split('T')[0],
          journey_date: searchData.date,
          passenger_name: validated.name,
          passenger_age: validated.age,
          passenger_gender: validated.gender,
          seat_numbers: selectedSeats,
          total_amount: totalAmount,
          booking_status: "confirmed",
          payment_status: "completed",
          payment_id: `PAY-${Date.now()}`,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update seat availability
      const { error: seatError } = await supabase
        .from("seats")
        .update({ is_available: false })
        .eq("train_id", train.id)
        .in("seat_number", selectedSeats);

      if (seatError) throw seatError;

      // Update train available seats
      const { error: trainError } = await supabase
        .from("trains")
        .update({ available_seats: train.availableSeats - selectedSeats.length })
        .eq("id", train.id);

      if (trainError) throw trainError;

      toast({
        title: "Booking Confirmed!",
        description: `Your booking ID is ${booking.id.slice(0, 8)}. Check your email for the e-ticket.`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: error.message || "Failed to complete booking. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!train || !selectedSeats) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Booking Data Found</h2>
            <p className="text-muted-foreground mb-6">Please start a new booking</p>
            <Button onClick={() => navigate("/search")}>Search Trains</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Seat Selection
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={passengerData.name}
                      onChange={(e) => setPassengerData({ ...passengerData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={passengerData.age}
                        onChange={(e) => setPassengerData({ ...passengerData, age: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Gender</Label>
                      <RadioGroup
                        value={passengerData.gender}
                        onValueChange={(value) => setPassengerData({ ...passengerData, gender: value })}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </RadioGroup>

                <p className="text-sm text-muted-foreground mt-4">
                  This is a demo application. No actual payment will be processed.
                </p>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Train</p>
                    <p className="font-medium">{train.name}</p>
                    <p className="text-sm text-muted-foreground">#{train.number}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Route</p>
                    <p className="font-medium">{searchData.from} → {searchData.to}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Journey Date</p>
                    <p className="font-medium">{searchData.date}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium">{selectedSeats.join(", ")}</p>
                  </div>

                  <div className="h-px bg-border"></div>

                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={loading || !passengerData.name || !passengerData.age}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By confirming, you agree to our Terms & Conditions
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
