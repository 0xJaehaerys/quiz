import Link from "next/link"
// import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Smartphone, Users, Zap, Play, TrendingUp, Star, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full">
            <Smartphone className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span className="text-sm font-medium text-accent">Farcaster Mini App</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance">
            Gelora Quiz
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed text-balance">
            Test your knowledge with interactive quizzes built for the Farcaster ecosystem. 
            Challenge yourself and compete with others in crypto, Web3, and NFT topics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/farcaster">
              <Button variant="accent" size="lg" className="min-w-[200px] text-base font-medium">
                <Play className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Play Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-[160px] text-base" asChild>
              <Link href="/quizzes">
                Browse Quizzes
              </Link>
            </Button>
          </div>
        </div>

      </section>

      {/* Features */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="gelora-typography-h1 text-foreground">Why Choose Gelora Quiz?</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Experience the most engaging quiz platform built for the Farcaster community
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 animate-stagger">
          <Card className="gelora-card-hover text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-foreground">Interactive Quizzes</CardTitle>
              <CardDescription className="leading-relaxed">
                Engaging quizzes with real-time feedback and detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted text-left">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Multiple choice questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Timer-based challenges</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Instant result feedback</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gelora-card-hover text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-foreground">Social Features</CardTitle>
              <CardDescription className="leading-relaxed">
                Share your achievements and compete with the Farcaster community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted text-left">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Leaderboards & rankings</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Share results to Farcaster</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Community challenges</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gelora-card-hover text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-foreground">Native Experience</CardTitle>
              <CardDescription className="leading-relaxed">
                Built specifically for Farcaster with seamless integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted text-left">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Optimized for mobile</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Farcaster authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Native sharing & cast</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quiz Categories */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="gelora-typography-h1 text-foreground">Quiz Categories</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Explore different topics and test your knowledge across various Web3 domains
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
          {[
            { name: "Cryptocurrency", count: 12, difficulty: "easy", icon: "₿" },
            { name: "Web3 & DApps", count: 8, difficulty: "hard", icon: "🌐" },
            { name: "NFTs", count: 6, difficulty: "medium", icon: "🎨" },
            { name: "DeFi", count: 10, difficulty: "hard", icon: "📊" },
          ].map((category) => (
            <Card key={category.name} className="gelora-card-hover group cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <CardTitle className="text-lg text-foreground group-hover:text-accent transition-colors">
                        {category.name}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {category.count} quizzes available
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={category.difficulty === 'easy' ? 'success' : 
                            category.difficulty === 'medium' ? 'default' : 'destructive'}
                  >
                    {category.difficulty}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Get Started */}
      <section className="space-y-12">
        <Card className="border-accent/20 bg-gradient-to-br from-card to-panel/50">
          <CardHeader className="text-center">
            <CardTitle className="gelora-typography-h1 text-foreground">Ready to Get Started?</CardTitle>
            <CardDescription className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              Join the Farcaster community and start testing your Web3 knowledge today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Open in Farcaster", 
                  description: "Click \"Play Now\" to access the quiz platform within Farcaster",
                  icon: Smartphone
                },
                {
                  step: "2",
                  title: "Choose Your Quiz",
                  description: "Browse through different categories and select a quiz that interests you",
                  icon: Star
                },
                {
                  step: "3",
                  title: "Play & Share",
                  description: "Answer questions, get your score, and share your results with the community",
                  icon: TrendingUp
                }
              ].map((item, index) => (
                <div key={item.step} className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                      <item.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">{item.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-8">
              <Link href="/farcaster">
                <Button variant="accent" size="lg" className="text-base font-medium">
                  <Play className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  Start Your First Quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Footer */}
      <footer className="text-center py-8 border-t border-border">
        <p className="text-muted text-sm">
          Built for Farcaster • Powered by Next.js & Neynar • Made with ❤️ by Gelora
        </p>
      </footer>
    </div>
  )
}
