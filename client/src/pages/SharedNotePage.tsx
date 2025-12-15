// SharedNotePage.tsx
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom'; 
import { useRef } from 'react'; 
import { api } from '../lib/api';
import { Loader2, NotebookPen, Lock, Tag, Calendar, Clock, Star, Download, User } from 'lucide-react';

// External Libraries for new features
import ReactMarkdown from 'react-markdown'; // 🎯 Markdown rendering
import jsPDF from 'jspdf'; // 🎯 PDF creation

// 🎯 NOTE: Ensure you have created the dom-to-image-more.d.ts file for TypeScript to be happy.
import * as domToImage from 'dom-to-image-more';

// UI Components (assuming these are defined in your project)
// Assuming these paths are correct for your UI library
import { Button } from "../components/ui/button"; 
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500"; 
const SECONDARY_TEXT_CLASS = "text-gray-600 dark:text-gray-400";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
};

// Interface for the actual Entry object
interface SharedEntry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    pinned?: boolean;
    isPublic: boolean;
    // CRITICAL FIX: Using 'createdAt' and 'updatedAt'
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

// Interface for the expected Backend Response
interface PublicEntryResponse {
    entry: SharedEntry; 
}

/**
 * Fetches and displays a public, read-only view of a note.
 */
export function SharedNotePage() {
    const { id } = useParams<{ id: string }>();

    // Ref to the element we want to convert to PDF
    const noteContentRef = useRef<HTMLDivElement>(null); 

    // 1. DATA FETCHING HOOK
    const { 
        data: entry, 
        isLoading, 
        isError, 
        error 
    } = useQuery<SharedEntry, Error>({
        queryKey: ['sharedEntry', id],
        queryFn: async (): Promise<SharedEntry> => {
            if (!id) throw new Error("Note ID is missing.");
            
            // Note: Uses the correct path `/entries/public/:id` as per backend definition
            const response = await api.get<PublicEntryResponse>(`/entries/public/${id}`);
            
            if (!response.data.entry) {
                throw new Error("Invalid response structure from server.");
            }
            
            return response.data.entry; 
        },
        enabled: !!id, 
        retry: 1, 
    });

    // ----------------------------------------------------------------------
    // PDF Download Handler (Using dom-to-image-more)
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
    // 2. Loading State
    // ----------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="mt-16 flex justify-center">
                <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // 3. Error State (404, etc.)
    // ----------------------------------------------------------------------
    if (isError || !entry) {
        const status = (error as any)?.response?.status;
        
        const errorMessage = status === 404
            ? "Note not found or link is invalid." 
            : "An unexpected error occurred while fetching the shared note."; 
            
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Lock className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold dark:text-white mb-2">Access Denied</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{errorMessage}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    The note may be private, deleted, or the share link is incorrect.
                </p>
                {/* User-requested link maintained */}
                <a href="/" className={`mt-6 ${PRIMARY_TEXT_CLASS} hover:underline`}>Go to Homepage</a>
            </div>
        );
    }
    
    // ----------------------------------------------------------------------
    // 4. Success Display
    // ----------------------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            
            {/* The target element for PDF generation */}
            <div 
                ref={noteContentRef} 
                className="bg-white p-8 dark:bg-gray-900"
            > 
                
                <Card 
                    className="shadow-2xl bg-white dark:bg-gray-800 border-t-4 border-fuchsia-500 print:shadow-none"
                >
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 leading-tight">
                                <NotebookPen className={`h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
                                {entry.title}
                            </CardTitle>
                            {entry.pinned && (
                                <div className="text-yellow-500 flex items-center gap-1 opacity-80 mt-1">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="text-sm font-semibold">PINNED</span>
                                </div>
                            )}
                        </div>
                        {entry.synopsis && (
                            <p className={`mt-3 text-lg ${SECONDARY_TEXT_CLASS} italic border-l-4 pl-4 border-fuchsia-300 dark:border-fuchsia-700`}>
                                {entry.synopsis}
                            </p>
                        )}
                        
                        {/* Author/Metadata block */}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center text-sm font-medium">
                                <User className={`h-4 w-4 mr-2 ${PRIMARY_TEXT_CLASS}`} />
                                <span className="text-gray-700 dark:text-gray-300 mr-4">
                                    Author: <strong className={`font-semibold ${PRIMARY_TEXT_CLASS}`}>{entry.user.firstName} {entry.user.lastName}</strong>
                                </span>
                                
                                <Badge variant="default" className="flex items-center gap-1 bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100 dark:bg-fuchsia-900 dark:text-fuchsia-300">
                                    <Tag className="h-3.5 w-3.5" /> {entry.category.name}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6 border-t dark:border-gray-700">
                        {/* Fixed Date Properties Display */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> Created: 
                                <strong className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(entry.createdAt).toLocaleTimeString(undefined, DATE_OPTIONS)}
                                </strong>
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> Last Updated: 
                                <strong className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(entry.updatedAt).toLocaleTimeString(undefined, DATE_OPTIONS)}
                                </strong>
                            </span>
                        </div>

                        {/* Content: Markdown Rendering */}
                        <div className="prose dark:prose-invert max-w-none prose-lg">
                            <ReactMarkdown>
                                {entry.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Download Button */}
            <div className="flex justify-center mt-8">
                <Button 
                    onClick={handleDownloadPdf} 
                    className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600 text-white font-semibold py-3 px-6 text-base rounded-lg shadow-xl transition-colors"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Download Note as PDF
                </Button>
            </div>
            
            <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-500">
                <p>
                    You are viewing a publicly shared note. The content is read-only.
                </p>
                {/* User-requested link maintained */}
                <a href="/" className={`mt-2 block ${PRIMARY_TEXT_CLASS} hover:underline font-medium`}>Return to your Notes</a>
            </footer>
        </div>
    );
}