import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarClock, CalendarDays, Users, Video } from "lucide-react";
import TourScheduler from "./tour-scheduler";
import { Property } from "@shared/schema";

interface PropertyTourWidgetProps {
  property: Property;
}

export default function PropertyTourWidget({ property }: PropertyTourWidgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatAddress = (property: Property) => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zipCode) parts.push(property.zipCode);
    return parts.join(", ");
  };

  const address = formatAddress(property);

  return (
    <Card className="border border-primary-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white p-4">
        <CardTitle className="text-lg font-bold flex items-center">
          <CalendarClock className="h-5 w-5 mr-2" />
          Schedule a Tour
        </CardTitle>
        <CardDescription className="text-secondary-100">
          See this property in person or virtually
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <p className="text-sm text-primary-600">
            Experience this property firsthand with a personalized tour that fits your schedule.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  In-Person
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] p-0">
                <TourScheduler 
                  propertyId={property.id} 
                  propertyTitle={property.title} 
                  propertyAddress={address}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Virtual
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] p-0">
                <TourScheduler 
                  propertyId={property.id} 
                  propertyTitle={property.title} 
                  propertyAddress={address}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <CalendarDays className="h-4 w-4 text-primary-400 mr-2" />
            <span className="text-xs text-primary-500">Available 7 days a week, 8am-8pm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}