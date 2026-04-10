import { Metadata } from 'next';
import { Phone, AlertTriangle, Heart, Shield, Flame, Ambulance, Car } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Emergency Contacts Pakistan — PakTourism',
  description: 'Important emergency numbers for travelers in Pakistan. Police, Ambulance, Fire, PTDC and more.',
};

const EMERGENCY_NUMBERS = [
  {
    category: 'National Emergency',
    icon: AlertTriangle,
    color: 'red',
    numbers: [
      { name: 'Police', number: '15', note: 'Available nationwide' },
      { name: 'Emergency (Rescue)', number: '1122', note: 'Punjab & KPK' },
      { name: 'Emergency (Edhi)', number: '115', note: 'Ambulance & rescue' },
      { name: 'Fire Brigade', number: '16', note: 'Available nationwide' },
      { name: 'Bomb Disposal', number: '1717', note: 'Punjab' },
    ],
  },
  {
    category: 'Medical & Ambulance',
    icon: Ambulance,
    color: 'green',
    numbers: [
      { name: 'Edhi Foundation', number: '115', note: '24/7 ambulance' },
      { name: 'Rescue 1122', number: '1122', note: 'Punjab / KPK ambulance' },
      { name: 'Aman Foundation (Karachi)', number: '115', note: 'Karachi ambulance' },
      { name: 'Chippa (Karachi)', number: '1020', note: 'Ambulance service' },
      { name: 'Bahbood Foundation (KPK)', number: '1737', note: 'KPK medical' },
    ],
  },
  {
    category: 'Travel & Tourism',
    icon: Shield,
    color: 'blue',
    numbers: [
      { name: 'PTDC (Tourism Corp)', number: '+92-51-9215761', note: 'Pakistan Tourism Dev Corp' },
      { name: 'Tourist Police Helpline', number: '1422', note: 'Punjab tourist police' },
      { name: 'Gilgit-Baltistan Police', number: '+92-581-920150', note: 'GB headquarters' },
      { name: 'NATCO (Bus Service)', number: '+92-51-9207870', note: 'Northern Areas Transport' },
    ],
  },
  {
    category: 'Highways & Transport',
    icon: Car,
    color: 'amber',
    numbers: [
      { name: 'NHA (Highways Authority)', number: '0800-00622', note: 'Road condition helpline' },
      { name: 'Motorway Police (Punjab)', number: '130', note: '24/7 motorway assistance' },
      { name: 'Motorway Police (M-1/2)', number: '+92-91-9213441', note: 'KPK motorway' },
      { name: 'AHAN (Road Assistance)', number: '0800-26426', note: 'Roadside assistance' },
    ],
  },
  {
    category: 'Utilities',
    icon: Flame,
    color: 'orange',
    numbers: [
      { name: 'SNGPL Gas Emergency', number: '1199', note: 'Gas leak / emergency' },
      { name: 'WAPDA / LESCO Fault', number: '118', note: 'Power outage / fault' },
      { name: 'PTCL Helpline', number: '1218', note: 'Telephone / internet' },
      { name: 'Jazz', number: '111', note: 'Telecom customer care' },
      { name: 'Telenor', number: '345', note: 'Telecom customer care' },
    ],
  },
];

const colorMap: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600',
  green: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-600',
  blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-600',
  amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-600',
  orange: 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 text-orange-600',
};

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <Heart size={22} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Emergency Contacts</h1>
            <p className="text-gray-400 text-sm">Pakistan travel safety numbers — save before you go</p>
          </div>
        </div>

        {/* Alert banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-8 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">
            In a life-threatening emergency, always call <strong>1122</strong> (Punjab/KPK) or <strong>15</strong> (Police) first.
            Keep this page bookmarked before traveling to remote areas.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {EMERGENCY_NUMBERS.map(({ category, icon: Icon, color, numbers }) => (
            <div key={category}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-3 ${colorMap[color]}`}>
                <Icon size={13} />
                {category}
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
                {numbers.map(({ name, number, note }) => (
                  <div key={name} className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{note}</p>
                    </div>
                    <a
                      href={`tel:${number.replace(/\s/g, '')}`}
                      className="shrink-0 inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-400 font-bold text-sm px-4 py-2 rounded-xl transition-colors"
                    >
                      <Phone size={13} />
                      {number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-xs text-center mt-10">
          Numbers verified as of 2025. Some numbers may vary by region. Always download offline maps before traveling to remote areas.
        </p>
      </div>
    </div>
  );
}
