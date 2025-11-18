import { Prisma } from '@prisma/client';
import { createSchema } from 'graphql-yoga';
import { prisma } from '../prismaClient';

const appointmentSelect = {
  id: true,
  userId: true,
  vehicleId: true,
  address: true,
  notes: true,
  slotStart: true,
  slotEnd: true,
  scheduleState: true,
  dispatchStatus: true,
  schedulingMode: true,
  arrivalWindowStart: true,
  arrivalWindowEnd: true,
  windowLockedAt: true,
  customerConfirmedAt: true,
  techId: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      trim: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
   type User {
name: String
email: String
}


type Vehicle {
id: String!
make: String
model: String
year: Int
trim: String
}


type Appointment {
id: String!
userId: String!
vehicleId: String!
address: String!
notes: String
slotStart: String!
slotEnd: String!
scheduleState: String!
dispatchStatus: String!
schedulingMode: String!
arrivalWindowStart: String
arrivalWindowEnd: String
windowLockedAt: String
customerConfirmedAt: String
techId: String
user: User
vehicle: Vehicle
}


type Query {
_empty: String!
appointments: [Appointment!]!
}


type Mutation {
internalConfirm(appointmentId: String!): Boolean
sendConfirmation(appointmentId: String!): Boolean
resendConfirmation(appointmentId: String!): Boolean
customerConfirm(appointmentId: String!): Boolean
setDraft(appointmentId: String!): Boolean
lockWindowNow(appointmentId: String!): Boolean
updateScheduleState(appointmentId: String!, state: String!): Boolean
updateDispatchStatus(appointmentId: String!, status: String!): Boolean
}
`,
  resolvers: {
    Query: {
      _empty: () => 'ok',
      appointments: async () => {
        return prisma.appointment.findMany({
          select: appointmentSelect,
          orderBy: { slotStart: 'asc' },
        });
      },
    },
    Appointment: {
      slotStart: (a: any) => (a.slotStart instanceof Date ? a.slotStart.toISOString() : a.slotStart),
      slotEnd: (a: any) => (a.slotEnd instanceof Date ? a.slotEnd.toISOString() : a.slotEnd),
      arrivalWindowStart: (a: any) => (a.arrivalWindowStart instanceof Date ? a.arrivalWindowStart.toISOString() : a.arrivalWindowStart),
      arrivalWindowEnd: (a: any) => (a.arrivalWindowEnd instanceof Date ? a.arrivalWindowEnd.toISOString() : a.arrivalWindowEnd),
      windowLockedAt: (a: any) => (a.windowLockedAt instanceof Date ? a.windowLockedAt.toISOString() : a.windowLockedAt),
      customerConfirmedAt: (a: any) => (a.customerConfirmedAt instanceof Date ? a.customerConfirmedAt.toISOString() : a.customerConfirmedAt),
    },
    Mutation: {
      internalConfirm: async (_: any, args: { appointmentId: string }) => {
        await prisma.appointment.update({
          where: { id: args.appointmentId },
          data: { scheduleState: 'INTERNAL_CONFIRMED' },
        });
        return true;
      },
    
    sendConfirmation: async (_: any, args: { appointmentId: string }) => {
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { scheduleState: 'SENT_TO_CUSTOMER' },
      });
      return true;
    },
    
    resendConfirmation: async (_: any, args: { appointmentId: string }) => {
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { scheduleState: 'SENT_TO_CUSTOMER' },
      });
      return true;
    },
    
    customerConfirm: async (_: any, args: { appointmentId: string }) => {
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { 
          scheduleState: 'CUSTOMER_CONFIRMED',
          customerConfirmedAt: new Date().toISOString()
        },
      });
      return true;
    },
    
    setDraft: async (_: any, args: { appointmentId: string }) => {
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { scheduleState: 'DRAFT' },
      });
      return true;
    },
    
    lockWindowNow: async (_: any, args: { appointmentId: string }) => {
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { windowLockedAt: new Date().toISOString() },
      });
      return true;
    },
    
    updateScheduleState: async (_: any, args: { appointmentId: string; state: string }) => {
      const validStates = ['DRAFT', 'INTERNAL_CONFIRMED', 'SENT_TO_CUSTOMER', 'CUSTOMER_CONFIRMED', 'CUSTOMER_DECLINED', 'CANCELLED'];
      if (!validStates.includes(args.state)) {
        throw new Error(`Invalid state: ${args.state}`);
      }
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { scheduleState: args.state },
      });
      return true;
    },
    
    updateDispatchStatus: async (_: any, args: { appointmentId: string; status: string }) => {
      const validStatuses = ['UNASSIGNED', 'ASSIGNED', 'IN_ROUTE', 'COMPLETE'];
      if (!validStatuses.includes(args.status)) {
        throw new Error(`Invalid status: ${args.status}`);
      }
      await prisma.appointment.update({
        where: { id: args.appointmentId },
        data: { dispatchStatus: args.status },
      });
      return true;
    },
  },
  },
});
