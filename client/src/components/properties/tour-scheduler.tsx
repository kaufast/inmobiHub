import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarClock, CalendarDays, UserRound, Users, Video, MapPin, Phone, Mail, Clock } from "lucide-react";

interface TourSchedulerProps {
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
}

type TimeSlot = string;

export default function TourScheduler({ propertyId, propertyTitle, propertyAddress }: TourSchedulerProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [tourType, setTourType] = useState<'in-person' | 'virtual'>('in-person');
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [additionalAttendees, setAdditionalAttendees] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(undefined);
  }, [selectedDate]);

  // Query for available time slots
  const { data: availableTimeSlots = [], isLoading } = useQuery({
    queryKey: ['/api/properties', propertyId, 'tour-slots', selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedDate) return [];
      const res = await apiRequest(
        "GET", 
        `/api/properties/${propertyId}/tour-slots?date=${format(selectedDate, 'yyyy-MM-dd')}`
      );
      return await res.json() as TimeSlot[];
    },
    enabled: !!selectedDate,
  });

  // Query for user's existing tours
  const { data: userTours = [] } = useQuery({
    queryKey: ['/api/user/tours'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/tours");
      return await res.json();
    },
    enabled: !!user,
  });

  // Mutation to schedule a tour
  const scheduleTourMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Please select a date and time for your tour");
      }

      const tourData = {
        tourDate: selectedDate.toISOString(),
        tourTime: selectedTime,
        tourType,
        notes,
        contactPhone: phone,
        contactEmail: email,
        additionalAttendees,
      };

      const res = await apiRequest(
        "POST", 
        `/api/properties/${propertyId}/tours`, 
        tourData
      );

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tour scheduled!",
        description: `Your ${tourType} tour has been scheduled for ${format(selectedDate!, 'MMMM d, yyyy')} at ${selectedTime}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tours'] });
      setActiveTab("upcoming");
      
      // Reset form
      setSelectedTime(undefined);
      setNotes("");
      setAdditionalAttendees(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to cancel a tour
  const cancelTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      const res = await apiRequest("POST", `/api/tours/${tourId}/cancel`);
      return await res.json();
    },
    onSuccess: (_, tourId) => {
      toast({
        title: "Tour cancelled",
        description: "Your tour has been successfully cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tours'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScheduleTour = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to schedule a tour.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Incomplete information",
        description: "Please select both a date and time for your tour.",
        variant: "destructive",
      });
      return;
    }

    scheduleTourMutation.mutate();
  };

  const handleCancelTour = (tourId: number) => {
    if (window.confirm("Are you sure you want to cancel this tour?")) {
      cancelTourMutation.mutate(tourId);
    }
  };

  // Filter tours for this property
  const propertyTours = userTours.filter((tour: any) => tour.propertyId === propertyId);
  
  // Sort by date (upcoming first)
  const sortedPropertyTours = [...propertyTours].sort((a: any, b: any) => {
    const dateA = new Date(`${a.tourDate}T${a.tourTime}`);
    const dateB = new Date(`${b.tourDate}T${b.tourTime}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Separate upcoming and past tours
  const now = new Date();
  const upcomingTours = sortedPropertyTours.filter((tour: any) => {
    const tourDateTime = new Date(`${tour.tourDate}T${tour.tourTime}`);
    return isAfter(tourDateTime, now) && tour.status !== 'cancelled';
  });
  
  const pastTours = sortedPropertyTours.filter((tour: any) => {
    const tourDateTime = new Date(`${tour.tourDate}T${tour.tourTime}`);
    return isBefore(tourDateTime, now) || tour.status === 'cancelled';
  });

  // Function to render a tour card
  const renderTourCard = (tour: any, isPast = false) => {
    const tourDate = new Date(tour.tourDate);
    const isCancelled = tour.status === 'cancelled';
    
    return (
      <Card key={tour.id} className={`mb-4 ${isCancelled ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {tour.tourType === 'virtual' ? 'Virtual Tour' : 'In-Person Tour'}
            </CardTitle>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(tour.status)}`}>
              {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
            </div>
          </div>
          <CardDescription>
            {format(tourDate, 'MMMM d, yyyy')} at {tour.tourTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary-500" />
              <span>{propertyAddress}</span>
            </div>
            {tour.tourType === 'in-person' && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary-500" />
                <span>{tour.duration} minutes</span>
              </div>
            )}
            {tour.notes && (
              <div className="mt-2 p-2 bg-primary-50 rounded-md text-primary-800">
                <p className="text-xs font-medium mb-1">Notes:</p>
                <p className="text-sm">{tour.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {!isPast && !isCancelled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCancelTour(tour.id)}
              disabled={cancelTourMutation.isPending}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              Cancel Tour
            </Button>
          )}
          {tour.tourType === 'virtual' && !isPast && !isCancelled && (
            <Button size="sm" className="ml-auto">
              <Video className="h-4 w-4 mr-2" />
              Join Virtual Tour
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Helper function to get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Organize time slots into morning, afternoon, and evening
  const morningSlots = availableTimeSlots.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 8 && hour < 12;
  });
  
  const afternoonSlots = availableTimeSlots.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  
  const eveningSlots = availableTimeSlots.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 17 && hour < 20;
  });

  return (
    <Card className="w-full shadow-md border-primary-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <CalendarClock className="h-5 w-5 mr-2 text-secondary-500" />
          Tour This Property
        </CardTitle>
        <CardDescription>
          Schedule a tour for {propertyTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="schedule">Schedule Tour</TabsTrigger>
            <TabsTrigger value="upcoming">
              Your Tours {upcomingTours.length > 0 && `(${upcomingTours.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-4">
                    <Label className="mb-2 block">Select Tour Type</Label>
                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        variant={tourType === 'in-person' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setTourType('in-person')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        In-Person
                      </Button>
                      <Button 
                        type="button" 
                        variant={tourType === 'virtual' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setTourType('virtual')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Virtual
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Label className="mb-2 block">Select a Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => 
                        // Disable past dates and dates more than 30 days in the future
                        isBefore(date, startOfDay(new Date())) || 
                        isAfter(date, addDays(new Date(), 30))
                      }
                      className="border rounded-md p-2"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <Label className="mb-2 block">
                      Available Times for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
                    </Label>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="text-center py-6 bg-primary-50 rounded-md">
                        <p className="text-primary-600">No available time slots for this date</p>
                        <p className="text-sm text-primary-500 mt-1">Please select another date</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {morningSlots.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-500 mb-2">Morning</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {morningSlots.map(time => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className="text-sm"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {afternoonSlots.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-500 mb-2">Afternoon</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {afternoonSlots.map(time => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className="text-sm"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {eveningSlots.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-500 mb-2">Evening</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {eveningSlots.map(time => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className="text-sm"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex mt-1">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-primary-300 bg-primary-50 text-primary-500">
                          <Phone className="h-4 w-4" />
                        </span>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="rounded-l-none"
                          placeholder="Your contact number"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="flex mt-1">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-primary-300 bg-primary-50 text-primary-500">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-l-none"
                          placeholder="Your email address"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="attendees">Additional Attendees</Label>
                      <div className="flex mt-1">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-primary-300 bg-primary-50 text-primary-500">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <Select
                          value={additionalAttendees.toString()}
                          onValueChange={(value) => setAdditionalAttendees(parseInt(value))}
                        >
                          <SelectTrigger id="attendees" className="rounded-l-none">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Just me</SelectItem>
                            <SelectItem value="1">+1 person</SelectItem>
                            <SelectItem value="2">+2 people</SelectItem>
                            <SelectItem value="3">+3 people</SelectItem>
                            <SelectItem value="4">+4 people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific requirements or questions for the agent"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingTours.length === 0 && pastTours.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md border-primary-200">
                <CalendarDays className="h-12 w-12 mx-auto text-primary-300 mb-3" />
                <h3 className="text-lg font-medium text-primary-900 mb-1">No tours scheduled</h3>
                <p className="text-primary-500 mb-4">You haven't scheduled any tours for this property yet.</p>
                <Button onClick={() => setActiveTab("schedule")}>Schedule a Tour</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingTours.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Upcoming Tours</h3>
                    <div className="space-y-3">
                      {upcomingTours.map((tour: any) => renderTourCard(tour))}
                    </div>
                  </div>
                )}
                
                {pastTours.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Past Tours</h3>
                    <div className="space-y-3">
                      {pastTours.map((tour: any) => renderTourCard(tour, true))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {activeTab === "schedule" && (
        <CardFooter>
          <Button 
            onClick={handleScheduleTour} 
            disabled={!selectedDate || !selectedTime || scheduleTourMutation.isPending}
            className="w-full"
          >
            {scheduleTourMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                Scheduling...
              </>
            ) : (
              <>Schedule {tourType === 'virtual' ? 'Virtual' : 'In-Person'} Tour</>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}