import React, { useState } from 'react'
import { MapPin, ExternalLink, Navigation } from 'lucide-react'

interface CampusLocation {
  name: string
  lat: number
  lon: number
  description: string
}

const DBS_LOCATIONS: CampusLocation[] = [
  {
    name: 'Aungier Street Campus (Main)',
    lat: 53.3387,
    lon: -6.2658,
    description: '13/14 Aungier St — Main Reception, Library, Lecture Theatres, IT Labs',
  },
  {
    name: 'Castle House Campus',
    lat: 53.3418,
    lon: -6.2642,
    description: "South Great George's St — Student Services, Careers & Registry",
  },
  {
    name: 'Balfe Street Campus',
    lat: 53.3409,
    lon: -6.2619,
    description: 'Balfe Street — Postgraduate Seminar Rooms & Faculty Offices',
  },
  {
    name: 'Dame Street Campus',
    lat: 53.3440,
    lon: -6.2640,
    description: 'Dame Street — Computing Laboratories & Project Collaboration Suites',
  },
]

interface CampusMapProps {
  locationName?: string
  className?: string
}

export const CampusMap: React.FC<CampusMapProps> = ({ locationName, className = '' }) => {
  // Determine if locationName matches any preset DBS location
  const matchedLocation = DBS_LOCATIONS.find((loc) =>
    locationName?.toLowerCase().includes(loc.name.split(' ')[0].toLowerCase())
  )

  const [activeLocation, setActiveLocation] = useState<CampusLocation>(
    matchedLocation || DBS_LOCATIONS[0]
  )

  const bboxDelta = 0.005
  const minLon = (activeLocation.lon - bboxDelta).toFixed(4)
  const minLat = (activeLocation.lat - bboxDelta).toFixed(4)
  const maxLon = (activeLocation.lon + bboxDelta).toFixed(4)
  const maxLat = (activeLocation.lat + bboxDelta).toFixed(4)

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${activeLocation.lat}%2C${activeLocation.lon}`
  const directOsmUrl = `https://www.openstreetmap.org/?mlat=${activeLocation.lat}&mlon=${activeLocation.lon}#map=17/${activeLocation.lat}/${activeLocation.lon}`

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
        <div>
          <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Navigation className="w-4 h-4" />
            <span>Campus Location Intelligence</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Dublin Business School (DBS) Interactive Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{activeLocation.description}</p>
        </div>

        <a
          href={directOsmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition shrink-0"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Campus Selector Buttons */}
      <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2">
        {DBS_LOCATIONS.map((loc) => {
          const isSelected = activeLocation.name === loc.name
          return (
            <button
              key={loc.name}
              type="button"
              onClick={() => setActiveLocation(loc)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-brand-600'}`} />
              <span>{loc.name.split(' (')[0]}</span>
            </button>
          )
        })}
      </div>

      {/* Embedded Map iFrame */}
      <div className="relative w-full h-64 sm:h-80 bg-slate-100">
        <iframe
          title="Dublin Business School OpenStreetMap"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>

      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>© OpenStreetMap contributors — Dublin, Ireland</span>
        <span className="font-medium text-slate-700">DBS Security Zone: Active</span>
      </div>
    </div>
  )
}

