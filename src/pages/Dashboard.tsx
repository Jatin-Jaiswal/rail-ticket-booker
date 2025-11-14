import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, Clock, CheckCircle, XCircle, Download } from "lucide-react";

// Mock data
const mockBookings = [
  {
    id: "BK001",
    trainName: "Express Metro",
    trainNumber: "12001",
    from: "Delhi",
    to: "Mumbai",
    date: "2024-03-25",
    time: "06:00 AM",
    seats: "A1, A2",
    status: "confirmed",
    price: 1700,
  },
  {
    id: "BK002",
    trainName: "Shatabdi Express",
    trainNumber: "12002",
    from: "Mumbai",
    to: "Bangalore",
    date: "2024-04-10",
    time: "08:30 AM",
    seats: "B3",
    status: "pending",
    price: 1200,
  },
];

const Dashboard = () => {
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
                  <p className="text-3xl font-bold mt-2">24</p>
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
                  <p className="text-3xl font-bold mt-2">2</p>
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
                  <p className="text-3xl font-bold mt-2">22</p>
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
            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{booking.trainName}</h3>
                          <p className="text-muted-foreground">Train #{booking.trainNumber}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="font-semibold">{booking.from}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">To</p>
                          <p className="font-semibold">{booking.to}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">{booking.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Seats</p>
                          <p className="font-semibold">{booking.seats}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold text-primary">₹{booking.price}</p>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
