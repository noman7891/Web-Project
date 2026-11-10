import React from 'react'
import { ShieldAlert, BookOpen, GraduationCap, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                CC
              </div>
              <span className="font-bold text-white text-base">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized University Student Services & Lost Property Recovery Portal. Built for
              Dublin Business School (DBS).
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <GraduationCap className="w-4 h-4 text-brand-400" />
              <span>MSc in Computing with Information Systems</span>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Academic Project
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>B9IS130: Web Development</span>
              </li>
              <li>Assessment: CA1 Individual Project</li>
              <li>Institution: Dublin Business School</li>
              <li>Submission: 10 November 2026</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Portal Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/listings" className="hover:text-white transition">
                  Browse Lost & Found
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-white transition">
                  Report Found Property
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Student Sign In
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 text-brand-300 font-medium transition"
                >
                  Swagger API Docs (OpenAPI)
                </a>
              </li>
            </ul>
          </div>

          {/* Campus Support */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Campus Security
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              To collect verified high-value property (laptops, phones, passports), visit the Security Desk:
            </p>
            <p className="text-xs text-slate-300 font-medium">
              Castle House Reception / Aungier St.
            </p>
            <p className="text-xs text-slate-400">Hours: Mon - Fri 08:00 - 21:00</p>
            <p className="text-xs text-slate-400 mt-1">Tel: (01) 417-7500</p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusConnect DBS. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Dublin
            Business School
          </p>
        </div>
      </div>
    </footer>
  )
}

