import { BookOpen, Headphones, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Rich Vocabularies",
        description: "Access curated vocabulary banks categorized by topics and levels (N5-N1).",
        icon: BookOpen,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "AI Audio Tests",
        description: "Practice listening with dynamically generated AI audio tests.",
        icon: Headphones,
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        title: "Track Progress",
        description: "Monitor your learning journey with detailed test result analytics.",
        icon: TrendingUp,
        color: "bg-green-500/10 text-green-500",
    },
    {
        title: "Earn Achievements",
        description: "Pass levels and earn badges as you master new topics.",
        icon: Trophy,
        color: "bg-amber-500/10 text-amber-500",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
                    <p className="text-lg text-muted-foreground">
                        Our platform provides comprehensive tools designed specifically for mastering the Japanese language.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
