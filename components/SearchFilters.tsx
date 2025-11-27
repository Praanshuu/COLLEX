"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, SlidersHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchFiltersProps {
    onFilterChange: (filters: {
        search: string
        category: string
        minPrice?: number
        maxPrice?: number
        sortBy: string
    }) => void
    initialCategory?: string
}

const categories = ["All", "Books & Notes", "Electronics", "Furniture", "PGs & Flatmates", "Vehicles & More"]

export function SearchFilters({ onFilterChange, initialCategory = "All" }: SearchFiltersProps) {
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState(initialCategory)
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [sortBy, setSortBy] = useState("newest")
    const [showFilters, setShowFilters] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange()
        }, 500)
        return () => clearTimeout(timer)
    }, [search, category, minPrice, maxPrice, sortBy])

    const handleFilterChange = () => {
        onFilterChange({
            search,
            category,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sortBy
        })
    }

    const clearFilters = () => {
        setSearch("")
        setCategory("All")
        setMinPrice("")
        setMaxPrice("")
        setSortBy("newest")
    }

    return (
        <div className="space-y-4 bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search listings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-background/50 border-white/20 focus:ring-primary"
                    />
                </div>

                {/* Toggle Advanced Filters (Mobile) */}
                <Button
                    variant="outline"
                    className="md:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>

                {/* Desktop Filters Row 1 */}
                <div className="hidden md:flex gap-4">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-48 bg-background/50 border-white/20">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 bg-background/50 border-white/20">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Advanced Filters (Price Range) */}
            {/* Advanced Filters (Price Range) */}
            <div className={`${showFilters ? "block" : "hidden"} md:block overflow-hidden transition-all duration-300 ease-in-out`}>
                <div className="pt-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Price Range:</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-24 bg-background/50 border-white/20"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-24 bg-background/50 border-white/20"
                        />
                    </div>

                    {/* Mobile Category/Sort (only visible on mobile when expanded) */}
                    <div className="md:hidden w-full space-y-2">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full bg-background/50 border-white/20">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full bg-background/50 border-white/20">
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(search || category !== "All" || minPrice || maxPrice || sortBy !== "newest") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
