'use client'
import React, { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  format,
  addMonths,
  subMonths,
  isToday,
  subDays,
  parseISO,
  getMinutes,
  isWithinInterval,
  parse,
  subWeeks,
} from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShiftAssign, Shift, events, LeaveReqest } from "@/components/model";
import dayjs from "dayjs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, } from '@/components/ui/drawer';
import { Button } from "@/components/ui/button";

interface HomepageProp {
  session: any;
}

const eventcolor = (type: string) => {
  switch (type) {
    case 'meeting':
      return '#8b0000';
    case 'remark':
      return '#696969';
    default:
      return '#90ee90';
  }
}

const HomePage = ({ session }: HomepageProp) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [shifts, setShifts] = useState<ShiftAssign[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedDayShifts, setSelectedDayShifts] = useState<ShiftAssign[]>([]);
  const employeeId = session?.user?.id;

  const [events, setEvents] = useState<events[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<events[]>([]);

  const [leaves, setLeaves] = useState<LeaveReqest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveReqest[]>([]);

  const fetchLeaves = async () => {
    const currentMonthNumber = currentMonth.getMonth() + 1; // Get the month (1-12)
    const currentYear = currentMonth.getFullYear(); // Get the year
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/calendar/${currentMonthNumber}/${currentYear}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      }
    }).then(res => res.json())
      .then(data => {
        setLeaves(data.data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const fetchEvents = async () => {
    const currentMonthNumber = currentMonth.getMonth() + 1; // Get the month (1-12)
    const currentYear = currentMonth.getFullYear(); // Get the year
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/calendar/${currentMonthNumber}/${currentYear}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      }
    }).then(res => res.json())
      .then(data => {
        setEvents(data.data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const fetchShifts = async () => {
    const currentMonthNumber = currentMonth.getMonth() + 1; // Get the month (1-12)
    const currentYear = currentMonth.getFullYear(); // Get the year
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shift-assign/calendar/${currentMonthNumber}/${currentYear}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      }
    }).then(res => res.json())
      .then(data => {
        setShifts(data.data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  useEffect(() => {
    fetchShifts();
    fetchEvents();
    fetchLeaves();
  }, [currentMonth]);

  // Check screen size to switch to 'day' view on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // Check for 'sm' screen size (640px or less)
        setView("day");
      } else {
        setView("month");
      }
    };

    handleResize(); // Set initial view on component mount

    window.addEventListener("resize", handleResize); // Update on window resize
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderHeader = () => {
    // Filter leave requests
    const todaysLeaves = leaves?.filter((leave) => {
      const startDate = parse(leave.start_date, 'dd-MM-yyyy', new Date());
      const endDate = parse(leave.end_date, 'dd-MM-yyyy', new Date());

      return (
        isWithinInterval(selectedDate, { start: startDate, end: endDate }) &&
        leave.employee_id === employeeId && leave.status === "approved"
      );
    });

    const isLeaveDay = todaysLeaves?.length > 0;
    return (
      <div className="flex justify-between items-center p-4 border-b shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => {
              switch (view) {
                case "day":
                  const newDate = subDays(selectedDate, 1)
                  setSelectedDate(newDate)
                  break;
                case "week":
                  const newWeek = subWeeks(selectedDate, 1)
                  setSelectedDate(newWeek)
                  break;
                default:
                  const newmonth = subMonths(currentMonth, 1)
                  setSelectedDate(newmonth)
                  setCurrentMonth(newmonth)
                  break;
              }
            }}
            className="p-2"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => {
              switch (view) {
                case "day":
                  const newDate = addDays(selectedDate, 1)
                  setSelectedDate(newDate)
                  break;
                case "week":
                  const newWeek = addDays(selectedDate, 7)
                  setSelectedDate(newWeek)
                  break;
                default:
                  const newmonth = addMonths(currentMonth, 1)
                  setSelectedDate(newmonth)
                  setCurrentMonth(newmonth)
                  break;
              }
            }}
            className="p-2"
          >
            <ChevronRight />
          </button>
          <h2 className={`text-lg font-semibold  mx-2 ${view === "day" && isToday(selectedDate) ? "text-red-500" : ""}`}>
            {view === "day" ? format(selectedDate, "d MMM yyyy") + (isLeaveDay ? " (Leave Day)" : "") : format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <Select
          value={view}
          onValueChange={(value) => setView(value)}
        >
          <SelectTrigger className="px-4 py-2  border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200 w-32">
            <span className="text-sm font-medium ">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          </SelectTrigger>

          <SelectContent className=" border border-gray-300 rounded-lg shadow-lg mt-1 max-w-xs">
            <SelectItem value="day" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Day</SelectItem>
            <SelectItem value="week" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Week</SelectItem>
            <SelectItem value="month" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 text-center py-2 border-b">
        {days?.map((day) => (
          <div key={day} className="text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        if (day > endDate) break;

        const formattedDate = format(day, "dd-MM-yyyy");
        const daynow = day;
        const isTodayDate = isToday(day);
        const isSameMonth = day.getMonth() === monthStart.getMonth();

        // Filter shifts and events
        const todayshifts = shifts?.filter((shift) => shift.date === formattedDate);
        const myshifts = todayshifts?.filter((shift) => shift.employee_id === employeeId);
        const todayevents = events?.filter((event) => event.date === formattedDate);

        // Filter leave requests
        const todaysLeaves = leaves?.filter((leave) => {
          const startDate = parse(leave.start_date, 'dd-MM-yyyy', new Date());
          const endDate = parse(leave.end_date, 'dd-MM-yyyy', new Date());

          return (
            isWithinInterval(day, { start: startDate, end: endDate }) &&
            leave.employee_id === employeeId && leave.status === "approved"
          );
        });

        const isLeaveDay = todaysLeaves?.length > 0;

        days.push(
          <div
            key={day.toString()}
            onClick={() => {
              const handleDayClick = () => {
                const dayShifts = shifts?.filter((shift) => shift.date === formattedDate);
                const dayEvents = events?.filter((event) => event.date === formattedDate);
                setSelectedDate(daynow);
                setSelectedDayShifts(dayShifts);
                setSelectedEvent(dayEvents);
                setSelectedLeave(todaysLeaves)
                setDrawerOpen(true);
              };
              handleDayClick();
            }}
            className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 h-24 flex flex-col items-start justify-start ${!isSameMonth ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"
              }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${isTodayDate
                ? "bg-red-500 text-white"
                : isSameDay(day, selectedDate)
                  ? "bg-blue-500 text-white"
                  : "bg-transparent"
                } ${isLeaveDay ? 'line-through' : ''}`}
            >
              {format(day, "d")}
            </span>

            {/* Render leave status */}
            {isLeaveDay && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-300">
                <span className="italic">LEAVE</span>
              </div>
            )}

            {/* Render shifts */}
            {myshifts?.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                {myshifts?.map((shift) => (
                  <div key={shift.id} className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: shift.shift?.color }}
                    ></span>
                    <span>{shift.shift?.name.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Render events */}
            {todayevents?.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                {todayevents?.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: eventcolor(event.event_type) }}
                    ></span>
                    <span>{event.event_type.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-px">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };





  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    const formattedDay = format(selectedDate, "dd-MM-yyyy");
    const dayShifts = shifts?.filter(shift => shift.date === formattedDay);
    const dayEvents = events?.filter(event => event.date === formattedDay);
    const myshifts = dayShifts?.filter(shift => shift.employee_id === employeeId);

    const todayLeave = leaves?.filter((leave) => {
      const startDate = parse(leave.start_date, 'dd-MM-yyyy', new Date());
      const endDate = parse(leave.end_date, 'dd-MM-yyyy', new Date());

      return (
        isWithinInterval(selectedDate, { start: startDate, end: endDate }) &&
        leave.employee_id === employeeId && leave.status === "approved"
      );
    });

    return (
      <div className="p-4 ">
        <div>
          {hours?.map(hour => (
            <div key={hour} className="relative flex items-start border-b p-2" onClick={() => {
              const handleDayClick = () => {
                const dayShifts = shifts?.filter(shift => shift.date === formattedDay);
                const dayEvents = events?.filter(event => event.date === formattedDay);
                setSelectedDate(selectedDate);
                setSelectedDayShifts(dayShifts);
                setSelectedEvent(dayEvents);
                setSelectedLeave(todayLeave)
                setDrawerOpen(true);
              };
              handleDayClick();
            }}>
              <span className="font-medium  text-lg w-16">{hour}</span>
              <div className="flex-grow relative flex flex-wrap">
                {myshifts?.map(shift => {
                  const shiftStart = shift.shift?.start_time;
                  const shiftEnd = shift.shift?.end_time;
                  const currentHour = hour;

                  const toMinutes = (time: string) => {
                    const [hours, minutes] = time?.split(":")?.map(Number);
                    return hours * 60 + minutes;
                  };

                  const shiftStartMinutes = toMinutes(shiftStart!);
                  const shiftEndMinutes = toMinutes(shiftEnd!);
                  const currentHourMinutes = toMinutes(currentHour);

                  if (shiftStartMinutes <= currentHourMinutes && shiftEndMinutes >= currentHourMinutes) {
                    return (
                      <div
                        key={shift.id}
                        className="text-white text-sm rounded p-1 m-1 flex-1"
                        style={{
                          backgroundColor: shift.shift?.color,
                        }}
                      >
                        {shift.shift?.name}
                      </div>
                    );
                  }

                  return null;
                })}
                {dayEvents?.map(event => {
                  const eventStart = event.start;
                  const eventEnd = event.end;
                  const currentHour = hour;

                  const toMinutes = (time: string) => {
                    const [hours, minutes] = time.split(":")?.map(Number);
                    return hours * 60 + minutes;
                  };

                  const eventStartMinutes = toMinutes(eventStart);
                  const eventEndMinutes = toMinutes(eventEnd);
                  const currentHourMinutes = toMinutes(currentHour);

                  if (eventStartMinutes <= currentHourMinutes && eventEndMinutes >= currentHourMinutes) {
                    return (
                      <div
                        key={event.id}
                        className="text-white text-sm rounded p-1 m-1 flex-1"
                        style={{
                          backgroundColor: eventcolor(event.event_type),
                        }}
                      >
                        {event.name}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDate);
    const days = Array.from({ length: 7 })?.map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    const formattedWeek = days?.map((day) => format(day, "dd-MM-yyyy"));

    return (
      <div className="p-4 ">
        {/* Header for days */}
        <div className="grid grid-cols-7 border-b">
          {days?.map(day => {
            const todayLeave = leaves?.filter((leave) => {
              const startDate = parse(leave.start_date, 'dd-MM-yyyy', new Date());
              const endDate = parse(leave.end_date, 'dd-MM-yyyy', new Date());

              return (
                isWithinInterval(day, { start: startDate, end: endDate }) &&
                leave.employee_id === employeeId && leave.status === "approved"
              );
            });

            const isLeaveDay = todayLeave?.length > 0
            return (
              <div key={day.toString()} className={`text-center p-2 border-l border-gray-200 ${isToday(day) && `text-red-500`}`}>
                {format(day, "EEE d")} {isLeaveDay && `(Leave)`}
              </div>
            )
          })}
        </div>

        {/* Grid for hours */}
        <div className="grid grid-cols-7 gap-0.5">
          {days?.map((day, dayIndex) => {
            const dayShifts = shifts?.filter(
              (shift) => shift.date === formattedWeek[dayIndex]
            );
            const dayEvents = events?.filter(
              (event) => event.date === formattedWeek[dayIndex]
            );
            const myShifts = dayShifts?.filter(
              (shift) => shift.employee_id === employeeId
            );

            return (
              <div key={day.toString()} className="border-l border-gray-200">
                {hours?.map((hour) => (
                  <div
                    onClick={() => {
                      const handleHourClick = () => {
                        const dayShifts = shifts?.filter(shift => shift.date === format(day, "dd-MM-yyyy"));
                        const dayEvents = events?.filter(event => event.date === format(day, "dd-MM-yyyy"));
                        setSelectedDate(day);
                        setSelectedDayShifts(dayShifts);
                        setSelectedEvent(dayEvents);
                        setDrawerOpen(true);
                      };
                      handleHourClick();
                    }}
                    key={hour}
                    className="relative flex items-center justify-between border-b h-12 p-2 overflow-y-auto hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-sm  w-16">{hour}</span>
                    <div className="flex-grow relative flex flex-row space-x-1">
                      {myShifts?.map((shift) => {
                        const toMinutes = (time: string) => {
                          const [hours, minutes] = time.split(":").map(Number);
                          return hours * 60 + minutes;
                        };

                        const shiftStart = toMinutes(shift.shift?.start_time || "00:00");
                        const shiftEnd = toMinutes(shift.shift?.end_time || "00:00");
                        const currentHour = toMinutes(hour);

                        if (shiftStart <= currentHour && shiftEnd >= currentHour) {
                          return (
                            <span
                              key={shift.id}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: shift.shift?.color }}
                            ></span>
                          );
                        }

                        return null;
                      })}
                      {dayEvents?.map((event) => {
                        const toMinutes = (time: string) => {
                          const [hours, minutes] = time.split(":")?.map(Number);
                          return hours * 60 + minutes;
                        };

                        const eventStart = toMinutes(event.start || "00:00");
                        const eventEnd = toMinutes(event.end || "00:00");
                        const currentHour = toMinutes(hour);

                        if (eventStart <= currentHour && eventEnd >= currentHour) {
                          return (
                            <span
                              key={event.id}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: eventcolor(event.event_type) }}
                            ></span>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderView = () => {
    if (view === "day") return renderDayView();
    if (view === "week") return renderWeekView();
    return (
      <>
        {renderDaysOfWeek()}
        {renderCells()}
      </>
    );
  };

  return (
    <div>
      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerContent className="max-h-screen">
          <DrawerHeader>
            <DrawerTitle>{dayjs(selectedDate).format("DD-MM-YYYY")} Info</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6 overflow-y-auto">
            {selectedLeave?.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg shadow">
                <h3 className="font-semibold text-red-500">Leave</h3>
                {selectedLeave?.map(leave => (
                  <div key={leave.id} className="flex flex-col space-y-1 border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span>{leave.leave_type.leave_type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Date: {dayjs(leave.start_date).format("DD-MM-YYYY")} - {dayjs(leave.end_date).format("DD-MM-YYYY")}</p>
                      <p>Reason: {leave.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-blue-50 p-3 rounded-lg shadow">
              <h3 className="font-semibold text-blue-700">My Shift</h3>
              {selectedDayShifts?.filter(shift => shift.employee_id === employeeId && shift.date === format(selectedDate, "dd-MM-yyyy"))?.map(shift => (
                <div key={shift.id} className="flex flex-col space-y-1 border-b border-gray-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.shift?.color }}></span>
                    <span>{shift.shift?.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{shift.shift?.description}</p>
                    <p>Date: {dayjs(shift.date).format("DD-MM-YYYY")}</p>
                    <p>Time: {shift.shift?.start_time} - {shift.shift?.end_time}</p>
                    <p>Employee: {shift?.employee?.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-green-50 p-3 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">Colleague Shifts</h3>
              {selectedDayShifts?.filter(shift => shift.employee_id !== employeeId && shift.date === format(selectedDate, "dd-MM-yyyy"))?.map(shift => (
                <div key={shift.id} className="flex flex-col space-y-1 border-b border-gray-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.shift?.color }}></span>
                    <span>{shift.shift?.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{shift.shift?.description}</p>
                    <p>Date: {dayjs(shift.date).format("DD-MM-YYYY")}</p>
                    <p>Time: {shift.shift?.start_time} - {shift.shift?.end_time}</p>
                    <p>Employee: {shift?.employee?.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg shadow">
              <h3 className="font-semibold text-yellow-700">Today News</h3>
              {selectedEvent?.map(event => (
                <div key={event.id} className="flex flex-col space-y-1 border-b border-gray-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: eventcolor(event.event_type) }}></span>
                    <span>{event.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{event.description}</p>
                    <p>Date: {dayjs(event.date).format("DD-MM-YYYY")}</p>
                    <p>Time: {event.start} - {event.end}</p>
                    <p>Description: {event?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div className="p-4">
        <div className="grid grid-cols-5 grid-rows-5 gap-4 bg-muted-200">
          <div className="col-span-5 row-span-5">
            {renderHeader()}
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
