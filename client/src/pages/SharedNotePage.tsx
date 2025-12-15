// SharedNotePage.tsx
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom'; 
import { useRef } from 'react'; 
import { api } from '../lib/api';
// Added User icon for author clarity
import { Loader2, NotebookPen, Lock, Tag, Calendar, Clock, Star, Download, User } from 'lucide-react';

// External Libraries for new features
import ReactMarkdown from 'react-markdown'; // 🎯 Markdown rendering
import jsPDF from 'jspdf'; // 🎯 PDF creation

// 🎯 NOTE: Ensure you have created the dom-to-image-more.d.ts file for TypeScript to be happy.
import * as domToImage from 'dom-to-image-more';

// UI Components (assuming these are defined in your project)
import { Button } from "../components/ui/button"; 
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// Define secondary class for better color consistency
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500"; 
const SECONDARY_TEXT_CLASS = "text-gray-600 dark:text-gray-400"; // New class for subtle text

// Date format is kept as 'long' as requested in the source code
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
};

// Interface for the actual Entry object - Structure is UNALTERED
interface SharedEntry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    pinned?: boolean;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    category: { name: string };
    user: { 
        firstName: string; 
        lastName: string; 
        username: string;
        avatar?: string;
    };
}

// Interface for the expected Backend Response - Structure is UNALTERED
interface PublicEntryResponse {
    entry: SharedEntry; 
}

/**
 * Fetches and displays a public, read-only view of a note.
 */
export function SharedNotePage() {
    const { id } = useParams<{ id: string }>();

    const noteContentRef = useRef<HTMLDivElement>(null); 

    // 1. DATA FETCHING HOOK - FUNCTIONALITY UNALTERED
    const { 
        data: entry, 
        isLoading, 
        isError, 
        error 
    } = useQuery<SharedEntry, Error>({
        queryKey: ['sharedEntry', id],
        queryFn: async (): Promise<SharedEntry> => {
            if (!id) throw new Error("Note ID is missing.");
            
            // NOTE: API path remains /public/entries/:id
            const response = await api.get<PublicEntryResponse>(`/public/entries/${id}`);
            
            if (!response.data.entry) {
                throw new Error("Invalid response structure from server.");
            }
            
            return response.data.entry; 
        },
        enabled: !!id, 
        retry: 1, 
    });

    // ----------------------------------------------------------------------
    // PDF Download Handler - FUNCTIONALITY UNALTERED
    // ----------------------------------------------------------------------
    const handleDownloadPdf = async () => {
        if (!entry || !noteContentRef.current) return;

        const imgData = await domToImage.toPng(noteContentRef.current, {
            quality: 1,
            cacheBust: true,
            bgcolor: 'white', 
        });

        const filename = `${entry.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 297; 
        
        const img = new Image();
        img.src = imgData;
        
        await new Promise<void>((resolve) => {
            img.onload = () => resolve();
        });

        const imgHeight = img.height * imgWidth / img.width;
        let heightLeft = imgHeight;
        let position = 0; 

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) { 
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
    };

    // ----------------------------------------------------------------------
    // 2. Loading State - UI/UX IMPROVED
    // ----------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="mt-20 flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className={`animate-spin h-10 w-10 ${PRIMARY_TEXT_CLASS} mb-3`} />
                <p className="text-lg text-gray-500 dark:text-gray-400">Loading shared note...</p>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // 3. Error State - UI/UX IMPROVED (Error messages remain the same)
    // ----------------------------------------------------------------------
    if (isError || !entry) {
        const status = (error as any)?.response?.status;
        
        const errorMessage = status === 404
            ? "Note not found or link is invalid." 
            : "An error occurred while fetching the shared note."; 
            
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Lock className="h-14 w-14 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold dark:text-white mb-3">Error Viewing Note</h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">{errorMessage}</p>
                <p className="text-base text-gray-500 dark:text-gray-500 mt-4">
                    Please check the URL or contact the owner.
                </p>
                {/* Link to homepage is UNALTERED */}
                <a href="/" className={`mt-8 text-lg font-semibold ${PRIMARY_TEXT_CLASS} hover:underline`}>Go to Homepage</a>
            </div>
        );
    }
    
    // ----------------------------------------------------------------------
    // 4. Success Display - UI/UX SIGNIFICANTLY IMPROVED
    // ----------------------------------------------------------------------
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            
            {/* The target element for PDF generation */}
            <div 
                ref={noteContentRef} 
                className="bg-white p-8 dark:bg-gray-900 rounded-xl" // Added rounded-xl for card appearance
            > 
                
                <Card 
                    className="shadow-2xl bg-white dark:bg-gray-800 border-t-8 border-fuchsia-500 print:shadow-none transition-shadow duration-300 hover:shadow-3xl"
                >
                    <CardHeader className="p-8 pb-4">
                        {/* Title and Pin Status */}
                        <div className="flex items-start justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
                            <CardTitle className="text-5xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4 leading-snug">
                                <NotebookPen className={`h-10 w-10 ${PRIMARY_TEXT_CLASS} flex-shrink-0`} />
                                {entry.title}
                            </CardTitle>
                            {entry.pinned && (
                                <div className="text-yellow-500 flex items-center gap-1 opacity-90 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                                    <Star className="h-6 w-6 fill-current" />
                                    <span className="text-base font-bold hidden sm:inline">PINNED</span>
                                </div>
                            )}
                        </div>

                        {/* Synopsis */}
                        {entry.synopsis && (
                            <p className={`mt-4 text-xl ${SECONDARY_TEXT_CLASS} italic border-l-4 pl-5 border-fuchsia-300 dark:border-fuchsia-700 leading-relaxed`}>
                                {entry.synopsis}
                            </p>
                        )}
                        
                        {/* Author and Category Block */}
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-6">
                            <div className="flex items-center text-base font-medium">
                                <User className={`h-5 w-5 mr-2 ${PRIMARY_TEXT_CLASS} flex-shrink-0`} />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Author: <strong className={`font-bold ${PRIMARY_TEXT_CLASS}`}>{entry.user.firstName} {entry.user.lastName}</strong>
                                </span>
                            </div>
                            
                            <Badge className="flex items-center gap-1 bg-fuchsia-600 text-white text-sm py-1.5 px-3 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 transition-colors">
                                <Tag className="h-4 w-4" /> {entry.category.name}
                            </Badge>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 pt-6 border-t dark:border-gray-700">
                        {/* Dates */}
                        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-10 text-base text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-fuchsia-500" /> Created: 
                                <strong className="ml-1 text-gray-700 dark:text-gray-300 font-medium">
                                    {new Date(entry.createdAt).toLocaleTimeString(undefined, DATE_OPTIONS)}
                                </strong>
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-fuchsia-500" /> Last Updated: 
                                <strong className="ml-1 text-gray-700 dark:text-gray-300 font-medium">
                                    {new Date(entry.updatedAt).toLocaleTimeString(undefined, DATE_OPTIONS)}
                                </strong>
                            </span>
                        </div>

                        {/* Content: Markdown Rendering with enhanced prose styling */}
                        <div className={`prose dark:prose-invert max-w-none prose-lg ${PRIMARY_TEXT_CLASS}`}>
                            <ReactMarkdown>
                                {entry.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Download Button - UNALTERED FUNCTIONALITY, IMPROVED UI/UX */}
            <div className="flex justify-center mt-12">
                <Button 
                    onClick={handleDownloadPdf} 
                    className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                    <Download className="h-5 w-5 mr-3" />
                    Download Note as PDF
                </Button>
            </div>
            
            {/* Footer - UI/UX IMPROVED */}
            <footer className="mt-16 text-center text-base text-gray-500 dark:text-gray-500 border-t pt-6 border-gray-100 dark:border-gray-700">
                <p>
                    You are viewing a publicly shared note. The content is read-only.
                </p>
                {entry.user && (
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                        Authored by **{entry.user.firstName} {entry.user.lastName} ({entry.user.username})**.
                    </p>
                )}
                {/* Link to homepage is UNALTERED */}
                <a href="/" className={`mt-4 block ${PRIMARY_TEXT_CLASS} hover:underline font-semibold`}>Return to your Notes</a>
            </footer>
        </div>
    );
}