"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

interface ContactSettings {
  contactEmail: string
  contactPhone: string
  contactLocation: {
    address: string
    lat: number
    lng: number
    mapUrl?: string // Added mapUrl to the interface
  }
}

export function DynamicFooter() {
  const [settings, setSettings] = useState<ContactSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="mt-8 py-4 text-center text-xs text-gray-400 border-t border-vintage-border">
     
      
      {/* Contact Information */}
      {!loading && settings && (
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 mt-2">
          {settings.contactEmail && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-vintage-accent">
                {settings.contactEmail}
              </a>
            </div>
          )}
          {settings.contactPhone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <a href={`tel:${settings.contactPhone}`} className="hover:text-vintage-accent">
                {settings.contactPhone}
              </a>
            </div>
          )}
          {settings.contactLocation?.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {settings.contactLocation.mapUrl ? (
                <a
                  href={settings.contactLocation.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-vintage-accent underline"
                >
                  {settings.contactLocation.address}
                </a>
              ) : (
                <span>{settings.contactLocation.address}</span>
              )}
            </div>
          )}
          <Link href="/contact" className="text-vintage-accent hover:underline">
            اتصل بنا
          </Link>
        </div>
      )}

      <div className="mb-2 mt-2">
        © {new Date().getFullYear()} منصة مخيمر. جميع الحقوق محفوظة. &nbsp;|&nbsp;
        <a href="https://yourplatform.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-vintage-accent">المطور</a>
      </div>

    </footer>
  )
} 