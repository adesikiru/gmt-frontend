export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  date?: string;
  eventId?: string;
  eventTitle?: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Authentic GMT Official Pictures from /public/gmt_Gallery
export const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'gmt-real-01',
    type: 'photo',
    url: '/gmt_Gallery/a5915b84-cb74-4217-b5ea-17c9bf34509b.JPG',
    title: 'GMT Leadership & Youth Stakeholders Solidary Handshake',
    description: 'High-level grassroots engagement and solidarity with youth influencers and community leaders in Ogun State.',
    category: 'Leadership',
    location: 'Ogun State Chapter Headquarters',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-02',
    type: 'photo',
    url: '/gmt_Gallery/04c172c5-8ae2-4118-abbe-ad7b87670eae.JPG',
    title: 'GMT Ogun State Executive Presentation Ceremony',
    description: 'Official presentation of customized commemorative awards to state patrons and community elders.',
    category: 'Inauguration',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-03',
    type: 'photo',
    url: '/gmt_Gallery/171de89a-2541-4e83-a650-aea5a7a42578.JPG',
    title: 'Grassroots Mobilization Council in Strategic Session',
    description: 'Ward coordinators and senatorial directors reviewing registration rollout across the 20 LGAs.',
    category: 'Leadership',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-04',
    type: 'photo',
    url: '/gmt_Gallery/1261b138-7966-43d5-9060-42c1adccea4c.JPG',
    title: 'State Working Committee Review & Ward Alignment',
    description: 'Executive committee members harmonizing grassroots voter verification and polling unit records.',
    category: 'Voter Education',
    location: 'Ogun Central Senatorial District',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-05',
    type: 'photo',
    url: '/gmt_Gallery/079eb026-e81b-496a-8059-e13d18ffbe81.JPG',
    title: 'GMT Ward Champions & Community Elders Assembly',
    description: 'Dignitaries and community leaders convening for grassroots outreach and membership mobilization.',
    category: 'Community',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-06',
    type: 'photo',
    url: '/gmt_Gallery/1db4afc9-73da-4649-8c2e-92bb84abfab8.JPG',
    title: 'Grassroots Leadership Delegation Dialogue',
    description: 'Key stakeholders and youth delegates deliberating on ward-by-ward empowerment and community outreach.',
    category: 'Leadership',
    location: 'Ogun State Chapter Secretariat',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-07',
    type: 'photo',
    url: '/gmt_Gallery/2d5f1dc6-6dfc-49bb-9c89-ff768234092c.JPG',
    title: 'Ogun State GMT Working Group Alignment',
    description: 'Coordination between senatorial district heads and local government directors.',
    category: 'Leadership',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-08',
    type: 'photo',
    url: '/gmt_Gallery/3a385323-b08d-4beb-a499-dba278e2efe8.JPG',
    title: 'Ward Coordinators Consultative Roundtable',
    description: 'Deliberations on voter sensitization and biometric verification at the polling unit tier.',
    category: 'Voter Education',
    location: 'Ijebu-Ode, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-09',
    type: 'photo',
    url: '/gmt_Gallery/4c0f2437-7da3-4c5c-b562-89e223bfca24.JPG',
    title: 'Community Stakeholders & Youth Empowerment Briefing',
    description: 'Grassroots leaders outlining vocational training schemes and digital entrepreneurship grants.',
    category: 'Empowerment',
    location: 'Sagamu, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-10',
    type: 'photo',
    url: '/gmt_Gallery/4f43ca79-2c0e-49b0-82f6-d9696f7c8eed.JPG',
    title: 'GMT Executive Leadership Congratulatory Moment',
    description: 'Honoring outstanding contributions of grassroots community organizers across Ogun wards.',
    category: 'Inauguration',
    location: 'Ogun State Chapter',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-11',
    type: 'photo',
    url: '/gmt_Gallery/5adc7d08-819d-419a-942c-7e575bf232ba.JPG',
    title: 'Ward Mobilization Strategy Council in Session',
    description: 'Strategic review of polling unit coverage, voter registry auditing, and citizen participation.',
    category: 'Voter Education',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-12',
    type: 'photo',
    url: '/gmt_Gallery/6d278451-cbd5-4d34-82b0-e1db0ce9e192.JPG',
    title: 'Ogun West & Central Delegates Joint Caucus',
    description: 'Harmonization of ward coordinators and community outreach teams across senatorial zones.',
    category: 'Leadership',
    location: 'Ilaro, Ogun West',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-13',
    type: 'photo',
    url: '/gmt_Gallery/6dee39c0-d36b-4aed-900d-f074827b6ca4.JPG',
    title: 'Grassroots Community Mobilizers Interactive Forum',
    description: 'Open discussion between ward champions and community representatives on local priorities.',
    category: 'Community',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-14',
    type: 'photo',
    url: '/gmt_Gallery/9cf803ab-7bb2-4f84-b768-4e9dbf4d858d.JPG',
    title: 'Executive Working Session on Membership Registry',
    description: 'Analyzing voter cards and national identity verification progress at ward level.',
    category: 'Voter Education',
    location: 'Ogun State Chapter Secretariat',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-15',
    type: 'photo',
    url: '/gmt_Gallery/a0161c2b-46ba-4828-a029-4c067b310099.JPG',
    title: 'Commemorative Token Presentation to Patron',
    description: 'Recognizing steadfast dedication to the Grassroots Movement for Tinubu in Ogun State.',
    category: 'Inauguration',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-16',
    type: 'photo',
    url: '/gmt_Gallery/a64d3fb0-43a1-42ec-b8e0-64d62c123cf2.JPG',
    title: 'GMT Chapter Directors in Strategic Deliberation',
    description: 'Reviewing logistical deployment of digital membership materials to rural wards.',
    category: 'Leadership',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-17',
    type: 'photo',
    url: '/gmt_Gallery/ade990b2-e6ed-4150-a3c3-5b8f5391e473.JPG',
    title: 'Senatorial Coordinators Consensus Meeting',
    description: 'Uniting grassroots coordinators across Ogun East, Ogun Central, and Ogun West.',
    category: 'Leadership',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-18',
    type: 'photo',
    url: '/gmt_Gallery/bde23ebe-2c7a-4cec-97d4-e4d1f392b94f.JPG',
    title: 'Grassroots Mobilizers Round-Table Consultation',
    description: 'Strengthening citizen engagement and community feedback mechanisms in local wards.',
    category: 'Community',
    location: 'Ota, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-19',
    type: 'photo',
    url: '/gmt_Gallery/c068c71b-0a61-420f-b62c-5933029765b7.JPG',
    title: 'Ward Leadership Strategy & Alignment Caucus',
    description: 'Planning civic outreach, voter education tours, and polling unit validation.',
    category: 'Voter Education',
    location: 'Ijebu-Ode, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-20',
    type: 'photo',
    url: '/gmt_Gallery/c211e698-c80e-4340-80a8-002c8033960a.JPG',
    title: 'Presentation of Official GMT Commemorative Insignia',
    description: 'Bestowing honorary movement insignias upon distinguished community leaders.',
    category: 'Inauguration',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-21',
    type: 'photo',
    url: '/gmt_Gallery/db73aa39-3f7e-472a-887e-f54627089926.JPG',
    title: 'Grassroots Engagement & Ward Coordinators Dialogue',
    description: 'Evaluating voter registration milestones and community empowerment implementation.',
    category: 'Leadership',
    location: 'Abeokuta, Ogun State',
    date: 'October 2026',
  },
  {
    id: 'gmt-real-22',
    type: 'photo',
    url: '/gmt_Gallery/f4fac14f-4932-4af8-9f96-79eea694f8fb.JPG',
    title: 'Executive Commemorative Timepiece Presentation',
    description: 'Official presentation honoring grassroots mobilization champions at state headquarters.',
    category: 'Inauguration',
    location: 'Ogun State Chapter Secretariat',
    date: 'October 2026',
  },
];

export function extractMediaFromEvents(events: Array<{
  id: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  startDate?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
}>): GalleryItem[] {
  const dynamicItems: GalleryItem[] = [];
  const seenUrls = new Set<string>();

  // Extract from events if they have images or videos
  for (const evt of events) {
    const formattedDate = evt.startDate
      ? new Date(evt.startDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
      : undefined;

    // Collect photos from event
    const photoUrls = [
      ...(evt.imageUrl ? [evt.imageUrl] : []),
      ...(Array.isArray(evt.images) ? evt.images : []),
    ];

    photoUrls.forEach((imgUrl, idx) => {
      if (imgUrl && !seenUrls.has(imgUrl)) {
        seenUrls.add(imgUrl);
        dynamicItems.push({
          id: `evt-${evt.id}-img-${idx}`,
          type: 'photo',
          url: imgUrl,
          title: idx === 0 ? evt.title : `${evt.title} (Photo ${idx + 1})`,
          description: evt.description || `Official photo from ${evt.title}`,
          category: evt.category || 'Events',
          location: evt.location,
          date: formattedDate,
          eventId: evt.id,
          eventTitle: evt.title,
        });
      }
    });

    // Collect videos from event
    const videoUrls = [
      ...(evt.videoUrl ? [evt.videoUrl] : []),
      ...(Array.isArray(evt.videos) ? evt.videos : []),
    ];

    videoUrls.forEach((vUrl, idx) => {
      if (vUrl && !seenUrls.has(vUrl)) {
        seenUrls.add(vUrl);
        dynamicItems.push({
          id: `evt-${evt.id}-vid-${idx}`,
          type: 'video',
          url: vUrl,
          thumbnailUrl: evt.imageUrl || getYoutubeThumbnail(vUrl) || undefined,
          title: idx === 0 ? `Video Coverage: ${evt.title}` : `Coverage ${idx + 1}: ${evt.title}`,
          description: evt.description || `Official video recording from ${evt.title}`,
          category: evt.category || 'Events',
          location: evt.location,
          date: formattedDate,
          eventId: evt.id,
          eventTitle: evt.title,
        });
      }
    });
  }

  // Prepend dynamic event items if any, then add authentic GMT gallery items
  const combined = [...dynamicItems];
  for (const def of defaultGalleryItems) {
    if (!seenUrls.has(def.url)) {
      combined.push(def);
      seenUrls.add(def.url);
    }
  }

  return combined;
}
