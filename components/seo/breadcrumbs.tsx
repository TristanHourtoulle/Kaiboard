import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredData } from './structured-data';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [
    { name: 'Home', url: '/' },
    ...items,
  ];

  return (
    <>
      <StructuredData 
        type="breadcrumb" 
        data={{ breadcrumbs: allItems }} 
      />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}
      >
        {allItems.map((item, index) => (
          <div key={`${item.url}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
            )}
            {index === 0 && (
              <Home className="w-4 h-4 mr-1 flex-shrink-0" />
            )}
            {index === allItems.length - 1 ? (
              <span 
                className="font-medium text-foreground truncate"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-foreground transition-colors truncate"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
} 