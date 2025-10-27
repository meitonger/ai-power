import { createSchema } from 'graphql-yoga';
import { prisma } from '../prismaClient';

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
slotStart: String!
slotEnd: String!
scheduleState: String!
dispatchStatus: String!
schedulingMode: String!
arrivalWindowStart: String
windowLockedAt: String
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
lockWindowNow(appointmentId: String!): Boolean
}
`,
resolvers: {
  Query: {
    _empty: () => 'ok',
    appointments: async () => {
      return prisma.appointment.findMany({
        include: {
          user: true,
          vehicle: true,
        },
      });
    },
  },
  Appointment: {
    slotStart: (a: any) => (a.slotStart instanceof Date ? a.slotStart.toISOString() : a.slotStart),
    slotEnd: (a: any) => (a.slotEnd instanceof Date ? a.slotEnd.toISOString() : a.slotEnd),
    arrivalWindowStart: (a: any) => (a.arrivalWindowStart instanceof Date ? a.arrivalWindowStart.toISOString() : a.arrivalWindowStart),
    windowLockedAt: (a: any) => (a.windowLockedAt instanceof Date ? a.windowLockedAt.toISOString() : a.windowLockedAt),
  },
  Mutation: {
    internalConfirm: async (_: any, args: { appointmentId: string }) => {
    await prisma.appointment.update({
    where: { id: args.appointmentId },
    data: { scheduleState: 'internal-confirmed' },
    });
    return true;
    },
    
    
    sendConfirmation: async (_: any, args: { appointmentId: string }) => {
    await prisma.appointment.update({
    where: { id: args.appointmentId },
    data: { scheduleState: 'confirmation-sent' },
    });
    return true;
    },
    
    
    resendConfirmation: async (_: any, args: { appointmentId: string }) => {
    await prisma.appointment.update({
    where: { id: args.appointmentId },
    data: { scheduleState: 'confirmation-resent' },
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
    },
    },
});
