import { Train, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
                <Train className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RailBook
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for seamless railway ticket booking across the nation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Search Trains
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Help Center</li>
              <li className="text-sm text-muted-foreground">FAQs</li>
              <li className="text-sm text-muted-foreground">Terms & Conditions</li>
              <li className="text-sm text-muted-foreground">Privacy Policy</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>support@railbook.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>1-800-RAIL-BOOK</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Railway Station Road, Metro City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RailBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
