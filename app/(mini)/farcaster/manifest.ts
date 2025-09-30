import { getPublicUrl } from '@/lib/fc'

export async function GET() {
  const publicUrl = getPublicUrl()
  
  const manifest = {
    name: "Gelora Quiz",
    version: "1.0.0",
    iconUrl: `${publicUrl}/icon.svg`,
    splashImageUrl: `${publicUrl}/splash.svg`,
    homeUrl: `${publicUrl}/farcaster`,
    description: "Interactive quiz platform for crypto, Web3, and NFT knowledge",
    author: {
      name: "Gelora Team",
      url: publicUrl
    },
    categories: ["education", "games"],
    permissions: [
      "user.profile.read"
    ],
    routes: [
      {
        path: "/",
        name: "Home",
        description: "Main quiz dashboard"
      },
      {
        path: "/quizzes",
        name: "Quiz Catalog",
        description: "Browse all available quizzes"
      },
      {
        path: "/quiz/:id",
        name: "Quiz Player",
        description: "Play a specific quiz"
      }
    ],
    theme: {
      primaryColor: "#000000",
      backgroundColor: "#ffffff",
      textColor: "#000000"
    }
  }

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}


