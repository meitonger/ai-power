// apps/web/pages/appointments/new.tsx
import React from 'react';
import Head from 'next/head';
import AppointmentForm from '../../components/AppointmentForm';

export default function NewAppointmentPage() {
  return (
    <>
      <Head>
        <title>New Appointment</title>
      </Head>
      <AppointmentForm
        onSuccess={(appt) => {

          console.log('Created:', appt);
        }}
      />
    </>
  );
}
