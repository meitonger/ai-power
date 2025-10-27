
export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    phone?: string | null;
  }
  
  export interface Vehicle {
    id: string;
    userId: string;
    make: string;
    model: string;
    year: number;
    trim: string;
    tireSize: string;
  }
  
  export interface Appointment {
    id: string;
    userId: string;
    vehicleId: string;
    slotStart: string;  // ISO
    slotEnd: string;    // ISO
    address: string;
    notes?: string | null;
  }
  