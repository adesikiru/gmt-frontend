'use client';

import { use, Suspense } from 'react';
import EventDetailsView from '@/components/EventDetailsView';

interface PageProps {
  params: Promise<{ id: string }>;
}

function EventDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <div className="w-full">
      <EventDetailsView eventId={resolvedParams.id} mode="dashboard" />
    </div>
  );
}

export default function DashboardEventDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col justify-center items-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading event details...</p>
        </div>
      }
    >
      <EventDetailContent {...props} />
    </Suspense>
  );
}
