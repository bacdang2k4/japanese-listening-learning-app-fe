import { BookOpen, Headphones, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Rich Vocabularies",
        description: "Access curated vocabulary banks categorized by topics and levels (N5-N1).",
        icon: BookOpen,
        color: "bg-elsa-indigo-50 text-elsa-indigo-600",
        borderColor: "hover:border-elsa-indigo-200",
    },
    {
        title: "AI Audio Tests",
        description: "Practice listening with dynamically generated AI audio tests.",
        icon: Headphones,
        color: "bg-elsa-purple-50 text-elsa-purple-600",
        borderColor: "hover:border-elsa-purple-200",
    },
    {
        title: "Track Progress",
        description: "Monitor your learning journey with detailed test result analytics.",
        icon: TrendingUp,
        color: "bg-emerald-50 text-emerald-600",
        borderColor: "hover:border-emerald-200",
    },
    {
        title: "Earn Achievements",
        description: "Pass levels and earn badges as you master new topics.",
        icon: Trophy,
        color: "bg-amber-50 text-amber-600",
        borderColor: "hover:border-amber-200",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-gradient-to-b from-background to-elsa-indigo-50/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elsa-indigo-50 text-elsa-indigo-600 text-xs font-semibold mb-4 border border-elsa-indigo-100">
                        FEATURES
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        Everything you need to succeed
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Our platform provides comprehensive tools designed specifically for mastering the Japanese language.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className={`border border-transparent shadow-elsa-sm hover:shadow-elsa-md transition-all duration-300 rounded-2xl hover:-translate-y-1 ${feature.borderColor}`}
                        >
                            <CardHeader className="pb-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
