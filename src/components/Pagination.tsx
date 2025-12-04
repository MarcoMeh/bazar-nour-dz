import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];

    // Show first page
    pages.push(1);

    // Show pages around current page
    if (currentPage > 3) {
        pages.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
    }

    // Show last page
    if (currentPage < totalPages - 2) {
        pages.push('...');
    }
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="الصفحة الأولى"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="الصفحة السابقة"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex gap-1">
                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-4 py-2">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="الصفحة التالية"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="الصفحة الأخيرة"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
        </div>
    );
}
