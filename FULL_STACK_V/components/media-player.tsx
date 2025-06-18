"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"

interface MediaPlayerProps {
  type: "audio" | "video"
  src: string
  title: string
  poster?: string
}

export function MediaPlayer({ type, src, title, poster }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null)

  useEffect(() => {
    const media = mediaRef.current

    if (!media) return

    const updateTime = () => setCurrentTime(media.currentTime)
    const updateDuration = () => setDuration(media.duration)
    const handleEnded = () => setIsPlaying(false)

    media.addEventListener("timeupdate", updateTime)
    media.addEventListener("durationchange", updateDuration)
    media.addEventListener("ended", handleEnded)

    return () => {
      media.removeEventListener("timeupdate", updateTime)
      media.removeEventListener("durationchange", updateDuration)
      media.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const media = mediaRef.current

    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current

    if (!media) return

    media.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const media = mediaRef.current

    if (!media) return

    const newVolume = value[0]
    media.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    const media = mediaRef.current

    if (!media) return

    const newMuted = !isMuted
    media.muted = newMuted
    setIsMuted(newMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const skip = (amount: number) => {
    const media = mediaRef.current

    if (!media) return

    media.currentTime = Math.max(0, Math.min(media.duration, media.currentTime + amount))
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {type === "video" ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            poster={poster}
            className="w-full aspect-video"
          />
        ) : (
          <div className="relative bg-vintage-paper-dark/10 p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-vintage-accent flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white translate-x-0.5" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground">بودكاست مخيمر</p>
                </div>
              </div>
              <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} className="hidden" />
            </div>
          </div>
        )}

        <div className="p-4 border-t border-vintage-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => skip(-10)}>
                <SkipBack className="h-4 w-4" />
                <span className="sr-only">رجوع 10 ثوان</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-10 w-10 p-0 border-vintage-border"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                <span className="sr-only">{isPlaying ? "إيقاف" : "تش��يل"}</span>
              </Button>

              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => skip(10)}>
                <SkipForward className="h-4 w-4" />
                <span className="sr-only">تقدم 10 ثوان</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="sr-only">{isMuted ? "تفعيل الصوت" : "كتم الصوت"}</span>
              </Button>

              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
