import { useState } from "react";
import type { Resource } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, Clock, CreditCard, Heart, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
    resource: Resource;
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
    onTagClick?: (tag: string) => void;
}

export function ResourceCard({ resource, isBookmarked, onToggleBookmark, onTagClick }: ResourceCardProps) {
    const [imgError, setImgError] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get Google favicon as a fallback
    const getFaviconUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
        } catch {
            return null;
        }
    };

    // Get tool initials for the final fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const primaryLogoSrc = resource.logo;
    const faviconSrc = getFaviconUrl(resource.link);

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use production URL for sharing
        const baseUrl = 'https://build-free.vercel.app';
        const url = `${baseUrl}?tool=${encodeURIComponent(resource.toolName)}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleBookmark?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col group relative overflow-visible border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-300 shadow-sm hover:shadow-md">

                {/* Top Highlight strip for Featured/Student Items - SOLID COLOR */}
                {resource.category === "Student ID Benefits" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                )}

                <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-3">
                        {/* Logo & Title */}
                        <div className="flex gap-4 items-start w-full">
                            <div className="shrink-0 relative">
                                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-2.5 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                                    {/* Primary Logo */}
                                    {primaryLogoSrc && !imgError && (
                                        <img
                                            src={primaryLogoSrc}
                                            alt={`${resource.toolName} logo`}
                                            className="w-full h-full object-contain"
                                            onError={() => setImgError(true)}
                                            loading="lazy"
                                        />
                                    )}
                                    {/* Favicon Fallback */}
                                    {(!primaryLogoSrc || imgError) && faviconSrc && !faviconError && (
                                        <img
                                            src={faviconSrc}
                                            alt={`${resource.toolName} logo`}
                                            className="w-full h-full object-contain"
                                            onError={() => setFaviconError(true)}
                                            loading="lazy"
                                        />
                                    )}
                                    {/* Initials Fallback */}
                                    {((!primaryLogoSrc && !faviconSrc) || (imgError && faviconError) || (imgError && !faviconSrc) || (!primaryLogoSrc && faviconError)) && (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg">
                                            {getInitials(resource.toolName)}
                                        </div>
                                    )}
                                </div>
                                {resource.indiaFriendly && (
                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 text-[12px] z-10" title="India Friendly">
                                        🇮🇳
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {resource.category}
                                    </Badge>
                                    {resource.badge && (
                                        <Badge variant="default" className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            {resource.badge}
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg leading-snug text-slate-900 dark:text-slate-50 pr-8">
                                    {resource.toolName}
                                </h3>
                            </div>
                        </div>

                        {/* Action Buttons - Repositioned to prevent hiding */}
                        <div className="absolute top-4 right-4 flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-full"
                                onClick={handleBookmark}
                            >
                                <Heart className={cn("w-4 h-4 transition-all duration-300", isBookmarked && "fill-rose-500 text-rose-500 scale-110")} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors rounded-full"
                                onClick={handleShare}
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-5 py-2 flex-grow flex flex-col gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {resource.useCase}
                    </p>

                    <div className="space-y-3 mt-auto">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                    {resource.freeWhat}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                            <div className="flex items-center gap-1.5 shrink-0" title="Duration">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium whitespace-nowrap">{resource.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0" title="Credit Card Requirement">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span className={cn("font-medium whitespace-nowrap", resource.requiresCreditCard === "No" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                    {resource.requiresCreditCard === "No" ? "No Card Req." : "Card Required"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {resource.tags.slice(0, 4).map(tag => (
                            <button
                                key={tag}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onTagClick?.(tag);
                                }}
                                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 mt-auto">
                    <Button
                        asChild
                        className={cn(
                            "w-full shadow-none transition-all duration-300 border font-medium",
                            resource.category === "Student ID Benefits"
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )}
                    >
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            Get Resource <ExternalLink className="w-4 h-4 opacity-50" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
