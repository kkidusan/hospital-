// app/reception-triage/follow-up/post-op/page.tsx
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function PostOpPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const postOpAppointments = await prisma.appointment.findMany({
    where: {
      followUpCategory: 'FOLLOW_UP',
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      appointmentDate: 'asc',
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Post-Op Follow-up</h1>
          <p className="text-gray-600 mt-2">Patients recovering from surgery or procedures requiring follow-up care</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Post-Op Appointments: <span className="font-semibold text-rose-600">{postOpAppointments.length}</span>
        </div>
      </div>

      {postOpAppointments.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 text-center">
          <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🏥</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Post-Op Appointments</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Patients scheduled for post-operative follow-up, stitch removal, or procedure review will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-rose-50">
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN / Card No</th>
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Date</th>
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-8 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {postOpAppointments.map((appointment) => {
                const date = new Date(appointment.appointmentDate);
                return (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-medium text-gray-900">{appointment.patient.fullName}</div>
                    </td>
                    <td className="px-8 py-6 text-gray-600 font-mono">
                      {appointment.patient.mrn || '—'}
                    </td>
                    <td className="px-8 py-6 text-gray-700">
                      {format(date, 'dd MMM yyyy')}
                    </td>
                    <td className="px-8 py-6 text-gray-700 font-medium">
                      {format(date, 'hh:mm a')}
                    </td>
                    <td className="px-8 py-6 text-gray-600">
                      {appointment.doctorName || appointment.doctor?.name || '—'}
                    </td>
                    <td className="px-8 py-6 text-gray-600 text-sm">
                      {appointment.reason || 'Post-Operative Follow-up'}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex gap-3 justify-center">
                        <Link
                          href={`/reception-triage/patient/${appointment.patient.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Patient
                        </Link>
                        <Link
                          href={`/reception-triage/appointment/${appointment.id}`}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-400">
        Post-Operative Follow-up Management
      </div>
    </div>
  );
}