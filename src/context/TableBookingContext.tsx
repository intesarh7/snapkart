"use client";

import { createContext, useContext, useState } from "react";
import TableBooking from "@/components/user/TableBooking";

interface ContextType {
  openBooking: (id: string) => void;
}

const TableBookingContext = createContext<ContextType | null>(null);

export const useTableBooking = () => {
  const context = useContext(TableBookingContext);
  if (!context) {
    throw new Error("useTableBooking must be used inside Provider");
  }
  return context;
};

export function TableBookingProvider({ children }: any) {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  const openBooking = (id: string) => {
    setRestaurantId(parseInt(id, 10));
  };

  const closeBooking = () => {
    setRestaurantId(null);
  };

  return (
    <TableBookingContext.Provider value={{ openBooking }}>
      {children}

      {restaurantId !== null && (
        <TableBooking
          restaurantId={restaurantId}
          onClose={closeBooking}
        />
      )}
    </TableBookingContext.Provider>
  );
}
