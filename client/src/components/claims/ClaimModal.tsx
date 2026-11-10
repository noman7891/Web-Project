import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Listing } from '../../types'
import { claimService } from '../../services/claimService'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage } from '../../services/api'
import { ShieldCheck, Info } from 'lucide-react'

export interface ClaimModalProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  if (!listing) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (explanation.trim().length < 15) {
      showToast('Please provide at least 15 characters describing proof of ownership.', 'warning')
      return
    }

    setLoading(true)
    try {
      await claimService.createClaim({
        listingId: listing._id,
        explanation: explanation.trim(),
      })
      showToast('Claim submitted successfully! Campus Security will review your details.', 'success')
      setExplanation('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      showToast(extractErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Found Property" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item preview banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0">
            {listing.image ? (
              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                Item
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{listing.title}</h4>
            <p className="text-xs text-slate-500">Found at: {listing.location}</p>
          </div>
        </div>

        {/* Guidance Notice */}
        <div className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-xl">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            To deter fraudulent claims, explain identifying marks that are <strong>not visible</strong>{' '}
            in the public photo (e.g., serial number, engravings, lock pattern, phone wallpaper, inside contents).
          </span>
        </div>

        {/* Form Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Proof of Ownership Explanation *
          </label>
          <textarea
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Describe unique details proving this item belongs to you..."
            className="w-full text-sm rounded-xl border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            required
            minLength={15}
            maxLength={2000}
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>Minimum 15 characters</span>
            <span>{explanation.length} / 2000</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Submit Claim
          </Button>
        </div>
      </form>
    </Modal>
  )
}

