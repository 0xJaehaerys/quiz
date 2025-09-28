"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function NavBar() {
  return (
    <nav className="border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/75 sticky top-0 z-50">
      <div className="gelora-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image
                src="/icon.svg"
                alt="Gelora Logo"
                width={32}
                height={32}
                className="w-full h-full"
                priority
              />
            </div>
            <span className="font-semibold text-lg text-foreground">Gelora Quiz</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/quizzes" 
              className="text-muted hover:text-foreground transition-colors text-sm font-medium"
            >
              Browse Quizzes
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-muted hover:text-foreground transition-colors text-sm font-medium"
            >
              Leaderboard
            </Link>
            <Link 
              href="/about" 
              className="text-muted hover:text-foreground transition-colors text-sm font-medium"
            >
              About
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link href="/farcaster">
              <Button className="gelora-button-accent flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Play Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
