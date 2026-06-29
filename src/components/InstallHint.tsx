'use client'

import { useEffect, useState } from 'react'

const KEY = 'faresay_install_dismissed_v1'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

// A gentle, dismissible nudge to install Faresay as a phone app. Hides itself if
// already installed, or once dismissed. Android gets a one-tap Install button;
// iOS gets the "Share → Add to Home Screen" instruction.
export function InstallHint() {
  const [show, setShow] = useState(false)
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem(KEY)) return } catch { /* ignore */ }
    // Already installed (standalone)? Don't nag.
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone
    if (standalone) return

    const ua = navigator.userAgent || ''
    const ios = /iphone|ipad|ipod/i.test(ua)
    setIsIOS(ios)

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); setShow(true) }
    window.addEventListener('beforeinstallprompt', onBIP)

    // iOS never fires beforeinstallprompt — show the manual hint on iPhones/iPads.
    if (ios) setShow(true)
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  function dismiss() {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setShow(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice.catch(() => null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="sm:hidden bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
      <span className="text-xl shrink-0" aria-hidden>📲</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-brand-900 text-sm">Add Faresay to your phone</p>
        {isIOS ? (
          <p className="text-xs text-sand-600 mt-0.5">Tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong> — Faresay opens like an app, no browser needed.</p>
        ) : (
          <p className="text-xs text-sand-600 mt-0.5">Install it as an app for one-tap access — no app store needed.</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {!isIOS && deferred && (
            <button onClick={install} className="bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-brand-700 transition">
              Install app
            </button>
          )}
          <button onClick={dismiss} className="text-xs text-sand-500 hover:text-sand-700">Not now</button>
        </div>
      </div>
    </div>
  )
}
