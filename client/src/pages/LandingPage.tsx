import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Laptop,
  CreditCard,
  Key,
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { listingService } from '../services/listingService'
import { Listing } from '../types'
import { ListingCard } from '../components/listings/ListingCard'

export const LandingPage: React.FC = () => {
  const [recentItems, setRecentItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await listingService.getListings({ limit: 4, sortBy: 'createdAt', order: 'desc' })
        setRecentItems(data.listings)
      } catch (err) {
        console.error('Failed to load recent listings', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-slate-900 to-slate-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            Official University Lost & Found Hub
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-brand-200">
              We Help You Recover It.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            No more disconnected WhatsApp groups or lost social posts. CampusConnect centralizes
            Dublin Business School's lost & found services with verified ownership claims and
            security desk moderation.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/listings">
              <Button size="lg" variant="primary" leftIcon={<Search className="w-5 h-5" />}>
                Search Lost & Found
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button
                size="lg"
                variant="outline"
                className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-800"
                leftIcon={<PlusCircle className="w-5 h-5 text-emerald-400" />}
              >
                Report Lost or Found Item
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-800 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">98%</p>
              <p className="text-xs text-slate-400 mt-1">Verification Rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-brand-400">&lt; 24h</p>
              <p className="text-xs text-slate-400 mt-1">Average Match Time</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Moderated Safety</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">Castle House</p>
              <p className="text-xs text-slate-400 mt-1">&amp; Aungier St. Desks</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CampusConnect Works
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A simple, secure 3-step workflow designed specifically for university students and staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Publish Listing</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Report an item you misplaced or an item you discovered on campus (library, canteen,
              lecture rooms, labs).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Submit Ownership Proof</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Found your item? Submit a private claim with secret identifiers (passcode, engraving,
              serial number, wallpaper).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Campus Security Verification</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Security administrators review and approve claims, facilitating safe pickup at the
              campus reception desk.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Published Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500 mt-1">Latest lost and found items on campus.</p>
          </div>
          <Link to="/listings" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All Listings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">No recent reports found.</p>
          </div>
        )}
      </section>

      {/* University Security Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Security Protocol
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hand In Valuable Items to Security
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              If you discover high-value items such as laptops, wallets, mobile phones, or passports,
              please report them on CampusConnect and hand the physical item to the Castle House or
              Aungier Street security desks immediately.
            </p>
          </div>
          <Link to="/create-listing" className="shrink-0">
            <Button size="lg" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
              Report Property Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

