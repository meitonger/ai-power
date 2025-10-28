// apps/web/pages/admin/appointments/new.tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppointmentForm from '../../../components/AppointmentForm';

export default function AdminNewAppointmentPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Admin · New Appointment</title>
      </Head>
      <AppointmentForm
        onSuccess={() => {
          router.push('/admin/dashboard');
        }}
      />
    </>
  );
}
