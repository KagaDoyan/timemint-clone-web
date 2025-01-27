"use client";

import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  type: "meeting" | "task";
  tag?: string;
}

interface DashboardPageProps {
  session: any;
}

export default function HomePage({ session }: DashboardPageProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "รอบนัดทดลอง",
      time: "08:56",
      location: "Timemint",
      type: "meeting",
      tag: "#27363A",
    },
    {
      id: "2",
      title: "ภาพรวมของราชการ",
      time: "10:00",
      location: "ตึกชัยอนันต์",
      type: "task",
    },
  ]);
  const [isHoliday, setIsHoliday] = useState<boolean | null>(null);
  const [shift, setShift] = useState<string | null>("Morning");

  useEffect(() => {
    if (date) {
      setIsHoliday(null); // Reset to loading state
      const formattedDate = format(date, "dd-MM-yyyy");
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays/is-holiday/${formattedDate}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status) {
            setIsHoliday(data.data);
          } else {
            console.error("Failed to fetch holiday status");
            setIsHoliday(false); // Set as not a holiday on failure
          }
        })
        .catch((error) => {
          console.error("Error fetching holiday status:", error);
          setIsHoliday(false); // Handle error
        });
    }
  }, [date, session]);

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6">
      {/* Calendar Section */}
      <div className="w-full md:w-1/3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border w-full"
        />
      </div>

      {/* Events Section */}
      <div className="flex-1 space-y-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {date && (
          <>
            {/* Selected Date */}
            <h2 className="text-lg font-semibold">
              {format(date, "d MMMM yyyy", { locale: th })}
            </h2>

            {/* Holiday or Workday Info */}
            {isHoliday === null ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Loading...</CardTitle>
                </CardHeader>
              </Card>
            ) : isHoliday ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    Today is a holiday!
                  </CardTitle>
                </CardHeader>
                {shift && (
                  <CardContent>
                    <div className="space-y-2">
                      <div>Shift: {shift}</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      Top Pic of the Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>Check-in Time: 08:00 AM</div>
                      <div>Check-out Time: 05:00 PM</div>
                      <div>Over Time: </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      Leave Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>Start Date: 27-01-2025</div>
                      <div>End Date: 27-01-2025</div>
                      <div>Total Days: 1</div>
                      <div>Reason: </div>
                      <div>Status: Pending</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Events List */}
            {events.map((event) => (
              <Card key={event.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Time */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{event.time}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>

                    {/* Tag (if present) */}
                    {event.tag && (
                      <Badge variant="outline" className="mt-2">
                        {event.tag}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
