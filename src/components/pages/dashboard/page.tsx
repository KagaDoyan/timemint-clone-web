"use client";

import React, { useState } from "react";
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
  session: {
    user: {
      roles: string[];
      name: string;
    };
  };
}

export default function DashboardPage({ session }: DashboardPageProps) {
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
      <div className="flex-1 space-y-4">
        {date && (
          <>
            {/* Selected Date */}
            <h2 className="text-lg font-semibold">
              {format(date, "d MMMM yyyy", { locale: th })}
            </h2>

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
