import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  journey_date: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  seat_numbers: string[];
  total_amount: number;
  booking_status: string;
  payment_status: string;
  trains: {
    train_name: string;
    train_number: string;
    source_station: string;
    destination_station: string;
    departure_time: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trains:train_id (
            train_name,
            train_number,
            source_station,
            destination_station,
            departure_time
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(data || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const upcoming = data?.filter(b => b.journey_date >= today && b.booking_status === 'confirmed').length || 0;
      const completed = data?.filter(b => b.journey_date < today && b.booking_status === 'confirmed').length || 0;

      setStats({
        total: data?.length || 0,
        upcoming,
        completed,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings and travel history</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Upcoming Trips</p>
                  <p className="text-3xl font-bold mt-2">{stats.upcoming}</p>
                </div>
                <div className="rounded-full bg-secondary/10 p-3">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-3xl font-bold mt-2">{stats.completed}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Bookings List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No bookings found
                </p>
                <Button onClick={() => window.location.href = "/search"}>
                  Book Your First Ticket
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{booking.trains.train_name}</h3>
                            <p className="text-muted-foreground">Train #{booking.trains.train_number}</p>
                          </div>
                          {getStatusBadge(booking.booking_status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-semibold">{booking.trains.source_station}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">To</p>
                            <p className="font-semibold">{booking.trains.destination_station}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{booking.journey_date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seats</p>
                            <p className="font-semibold">{booking.seat_numbers.join(", ")}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Paid</p>
                          <p className="text-2xl font-bold text-primary">₹{booking.total_amount}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;