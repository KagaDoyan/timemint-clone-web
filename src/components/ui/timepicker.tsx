"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value?: string; // Expected in "HH:mm" format
  onChange?: (time: string) => void; // Returns time in "HH:mm" format
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "HH:mm",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Extract hour and minute from the value string
  const currentHour = value ? parseInt(value.split(":")[0], 10) : undefined;
  const currentMinute = value ? parseInt(value.split(":")[1], 10) : undefined;

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    const hour = type === "hour" ? val : currentHour ?? 0;
    const minute = type === "minute" ? val : currentMinute ?? 0;

    const newTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    onChange?.(newTime);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours?.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={"ghost"}
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      currentHour === hour && "bg-accent"
                    )}
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes?.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={"ghost"}
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      currentMinute === minute && "bg-accent"
                    )}
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
