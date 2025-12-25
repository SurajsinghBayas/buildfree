import { useEffect, useState } from "react";
import type { Resource } from "@/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Sun, Moon, Heart, ExternalLink, Send, Mail, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { smartSearch } from "@/lib/smartSearch";



export function Home() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOption, setSortOption] = useState("recommended");
    const [categories, setCategories] = useState<string[]>(["All"]);

    // New Features State
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [hackathonsOpen, setHackathonsOpen] = useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);

    // Use state for icon only, DOM handles the actual theme
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });


    // Initialize Theme & URL Params
    useEffect(() => {
        // Dark Mode Check
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }

        // Load bookmarks
        const saved = localStorage.getItem("buildFreeBookmarks");
        if (saved) setBookmarks(new Set(JSON.parse(saved)));

        // Check URL for tool and category sharing
        const params = new URLSearchParams(window.location.search);
        const sharedTool = params.get("tool");
        const sharedCategory = params.get("category");
        if (sharedTool) {
            setSearchTerm(sharedTool);
        }
        if (sharedCategory) {
            setSelectedCategory(decodeURIComponent(sharedCategory));
        }

        fetch("/resources.json")
            .then((res) => res.json())
            .then((data: Resource[]) => {
                setResources(data);
                const uniqueCategories = ["All", ...Array.from(new Set(data.map((r) => r.category))).sort()];
                setCategories(uniqueCategories);
            })
            .catch((err) => console.error("Failed to load resources:", err));
    }, []);

    // Toggle Dark Mode - No re-render, just DOM update
    const toggleTheme = () => {
        const html = document.documentElement;
        const willBeDark = !html.classList.contains('dark');

        if (willBeDark) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        setIsDark(willBeDark);
    };

    // Toggle Bookmark
    const toggleBookmark = (toolName: string) => {
        const newBookmarks = new Set(bookmarks);
        if (newBookmarks.has(toolName)) {
            newBookmarks.delete(toolName);
        } else {
            newBookmarks.add(toolName);
        }
        setBookmarks(newBookmarks);
        localStorage.setItem("buildfree_bookmarks", JSON.stringify(Array.from(newBookmarks)));
    };



    // Filtering Logic
    useEffect(() => {
        let result = [...resources];

        // 1. Filter by Category
        if (selectedCategory !== "All") {
            if (selectedCategory === "My Stack") {
                result = result.filter(r => bookmarks.has(r.toolName));
            } else {
                result = result.filter((r) => r.category === selectedCategory);
            }
        }

        // 2. Smart Search with intent detection & synonym expansion
        if (searchTerm.trim()) {
            result = smartSearch(result, searchTerm);
        }

        // 3. Sort
        if (sortOption === "name") {
            result.sort((a, b) => a.toolName.localeCompare(b.toolName));
        } else if (sortOption === "recent") {
            result.sort((a, b) => b.lastVerified.localeCompare(a.lastVerified));
        }

        setFilteredResources(result);
    }, [searchTerm, selectedCategory, sortOption, resources, bookmarks]);


    // Update URL when category changes (for sharing)
    useEffect(() => {
        const url = new URL(window.location.href);
        if (selectedCategory && selectedCategory !== "All") {
            url.searchParams.set("category", selectedCategory);
        } else {
            url.searchParams.delete("category");
        }
        // Update URL without page reload
        window.history.replaceState({}, "", url.toString());
    }, [selectedCategory]);

    // Roadmap Presets
    const applyRoadmap = (type: string) => {
        setSearchTerm("");
        if (type === "hackathon") {
            setSearchTerm("hackathon");
        } else if (type === "student") {
            setSelectedCategory("Student ID Benefits");
        } else if (type === "startup") {
            setSearchTerm("hosting auth database");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
                        {/* Premium Logo Mark */}
                        <div className="relative">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                <span className="text-white font-black text-lg tracking-tighter">B</span>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" title="Free resources available"></div>
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">BuildFree</span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">FREE DEV TOOLS</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Student Pack Quick Access */}
                        <div className="hidden md:flex">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyRoadmap('student')}
                                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                🎓 Student Pack
                            </Button>
                        </div>

                        {/* Theme Toggle */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isDark ? "dark" : "light"}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </Button>

                        {/* Hackathons Dialog */}
                        <Dialog open={hackathonsOpen} onOpenChange={setHackathonsOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 active:scale-95 transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'instant' });
                                        setTimeout(() => setHackathonsOpen(true), 50);
                                    }}
                                >
                                    <Trophy className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Hackathons</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-2xl">
                                <DialogHeader className="text-left">
                                    <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        Find Hackathons <span>🇮🇳</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Discover upcoming hackathons in India!
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3 py-2">
                                    {/* Unstop */}
                                    <a
                                        href="https://unstop.com/hackathons"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 bg-white dark:bg-slate-900 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-xl">🚀</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">Unstop</h4>
                                            <p className="text-xs text-slate-500 truncate">India's largest hackathon platform</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                    </a>

                                    {/* Hack2Skill */}
                                    <a
                                        href="https://vision.hack2skill.com/hackathons-listing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-slate-900 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-xl">💻</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">Hack2Skill</h4>
                                            <p className="text-xs text-slate-500 truncate">Tech-focused hackathons</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                    </a>

                                    {/* Devfolio */}
                                    <a
                                        href="https://devfolio.co/hackathons"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-xl">🔷</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Devfolio</h4>
                                            <p className="text-xs text-slate-500 truncate">Web3 & developer hackathons</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                    </a>

                                    {/* MLH */}
                                    <a
                                        href="https://mlh.io/seasons/2025/events"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 bg-white dark:bg-slate-900 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-xl">🎯</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">MLH</h4>
                                            <p className="text-xs text-slate-500 truncate">Major League Hacking (Global)</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                    </a>
                                </div>

                                <p className="text-[10px] sm:text-xs text-slate-500 text-center pt-2">
                                    💡 Use BuildFree tools to build your hackathon project!
                                </p>
                            </DialogContent>
                        </Dialog>


                        {/* Submit Resource Dialog */}
                        <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm active:scale-95 transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'instant' });
                                        setTimeout(() => setSubmitOpen(true), 50);
                                    }}
                                >
                                    <Plus className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Submit</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-2xl sm:rounded-2xl">
                                <DialogHeader className="text-left">
                                    <DialogTitle className="text-lg sm:text-xl">Submit a Resource</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Know a tool with an amazing free tier? Share it!
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    {/* Submission Options */}
                                    <div className="grid gap-2.5">
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Choose how to submit:</p>

                                        {/* Option 1: Google Form */}
                                        <a
                                            href="https://forms.gle/reBbTgRUzPaHngch8"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 transition-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Quick Form</h4>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Fill out a simple form (2 min)</p>
                                            </div>
                                            <Send className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                                        </a>

                                        {/* Option 2: Email */}
                                        <a
                                            href="mailto:surajyou45@gmail.com?subject=New Resource Submission - BuildFree&body=Tool Name:%0D%0AWebsite URL:%0D%0AFree Tier Details:%0D%0AWhy it's great:"
                                            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Email Us</h4>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Send details to our team</p>
                                            </div>
                                            <Send className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                                        </a>

                                    </div>

                                    {/* What we're looking for */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">What we're looking for:</p>
                                        <ul className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 space-y-0.5 sm:space-y-1">
                                            <li>✓ Generous free tier (not just a trial)</li>
                                            <li>✓ Useful for developers/designers</li>
                                            <li>✓ Accessible worldwide</li>
                                            <li>✓ No credit card required (ideal)</li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            {/* Hero & Search */}
            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white leading-tight">
                            Build your dreams for <span className="text-indigo-600 dark:text-indigo-500">Free</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Discover the ultimate directory of free tier tools, student benefits, and hidden gems to launch your next project.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative max-w-xl mx-auto group"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <Input
                                type="search"
                                placeholder="Search 'hosting', 'database', 'student'..."
                                className="pl-12 h-14 text-lg border-2 border-transparent bg-white dark:bg-slate-900 shadow-xl rounded-2xl focus-visible:ring-0 focus-visible:border-indigo-500 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Controls */}
                <div className="space-y-6 mb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                            <Button
                                variant={selectedCategory === "My Stack" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(selectedCategory === "My Stack" ? "All" : "My Stack")}
                                className={cn(
                                    "rounded-full h-9 px-4 text-xs font-medium border-slate-200 dark:border-slate-800 transition-all",
                                    selectedCategory === "My Stack"
                                        ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/20"
                                        : "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                )}
                            >
                                <Heart className={cn("w-3.5 h-3.5 mr-1.5", selectedCategory === "My Stack" ? "fill-current" : "")} />
                                My Stack {bookmarks.size > 0 && <span className="ml-1 opacity-80">({bookmarks.size})</span>}
                            </Button>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
                            <p className="text-sm text-slate-500 font-medium hidden md:block">Filters:</p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto min-w-[140px]">
                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-full md:w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs font-medium rounded-lg">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recommended">✨ Recommended</SelectItem>
                                    <SelectItem value="recent">🕒 Last Verified</SelectItem>
                                    <SelectItem value="name">🔤 Name (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Mobile Category Dropdown */}
                    <div className="md:hidden">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11 text-sm font-medium rounded-xl">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category === "Student ID Benefits" && "🎓 "}
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Desktop Category Pills */}
                    <div className="hidden md:flex flex-wrap items-center gap-2">
                        {categories.map(category => {
                            const isStudentBenefits = category === "Student ID Benefits";
                            const isGoogleResources = category === "Google Resources";
                            const isSelected = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border select-none",
                                        // Default styles
                                        !isSelected && !isStudentBenefits && !isGoogleResources && "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                                        // Selected default
                                        isSelected && !isStudentBenefits && !isGoogleResources && "bg-indigo-600 text-white border-transparent shadow-md transform scale-105",
                                        // Student Benefits styles
                                        isStudentBenefits && !isSelected && "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400",
                                        isStudentBenefits && isSelected && "bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900 border-transparent shadow-md transform scale-105",
                                        // Google Resources styles - GDG colors
                                        isGoogleResources && !isSelected && "border-[#4285F4] bg-gradient-to-r from-blue-50 via-red-50 via-yellow-50 to-green-50 dark:from-blue-950/30 dark:via-red-950/30 dark:via-yellow-950/30 dark:to-green-950/30 text-[#4285F4] dark:text-[#8AB4F8]",
                                        isGoogleResources && isSelected && "text-white border-transparent shadow-md transform scale-105"
                                    )}
                                    style={isGoogleResources && isSelected ? {
                                        background: "linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC04 66%, #34A853 100%)"
                                    } : undefined}
                                >
                                    {isStudentBenefits && <span className="mr-1.5">🎓</span>}
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start min-h-[50vh]">
                    <AnimatePresence mode="popLayout">
                        {filteredResources.map((resource, idx) => (
                            <ResourceCard
                                key={resource.toolName + idx}
                                resource={resource}
                                isBookmarked={bookmarks.has(resource.toolName)}
                                onToggleBookmark={() => toggleBookmark(resource.toolName)}
                                onTagClick={(tag) => setSearchTerm(tag)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {filteredResources.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="inline-flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No resources found</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            We couldn't find anything matching "{searchTerm}". Try adjusting your search keywords.
                        </p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }} className="mt-4 text-indigo-600">
                            Clear all filters
                        </Button>
                    </motion.div>
                )}
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Branding */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <div className="flex flex-col -space-y-0.5">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">BuildFree</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Free Dev Tools Directory</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/surajsinghbayas"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                title="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                <span className="text-sm font-medium hidden sm:inline">GitHub</span>
                            </a>
                            <a
                                href="https://linkedin.com/in/surajbayas"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                                title="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                <span className="text-sm font-medium hidden sm:inline">LinkedIn</span>
                            </a>
                            <a
                                href="mailto:surajyou45@gmail.com"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                                title="Email"
                            >
                                <Mail className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">Email</span>
                            </a>
                        </div>

                        {/* Copyright & Stats */}
                        <div className="flex flex-col items-center sm:items-end gap-2">
                            <div className="flex items-center gap-3">
                                {/* Visitor Counter Badge */}
                                <a href="https://build-free.vercel.app" className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Live
                                    </span>
                                </a>
                                {/* Free Tools Badge */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                    <span className="text-xs">🔥</span>
                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                        {resources.length}+ Tools
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs">
                                © {new Date().getFullYear()} BuildFree. Made with ❤️ in India
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
