import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {enUS} from "date-fns/locale/en-US";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function BookingCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((b: any) => ({
          title: `${b.restaurant.name} (${b.guests})`,
          start: new Date(b.bookingDate),
          end: new Date(b.bookingDate),
        }));
        setEvents(formatted);
      });
  }, []);

  return (
    <div className="p-8 bg-white">
      <h1 className="text-xl font-semibold mb-6">
        Booking Calendar
      </h1>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
}
