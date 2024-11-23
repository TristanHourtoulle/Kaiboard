"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";

export function HeaderBreadcrumb() {
  const pathname = usePathname(); // Obtenir le chemin actuel
  const segments = pathname.split("/").filter((segment) => segment); // Divise le chemin en segments

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mb-4">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Breadcrumbs dynamiques */}
        <Breadcrumb>
          <BreadcrumbList>
            {/* Premier élément : "Platform" */}
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Platform</BreadcrumbLink>
            </BreadcrumbItem>

            {/* Séparateur */}
            {segments.length > 0 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}

            {/* Affichage des segments */}
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = "/" + segments.slice(0, index + 1).join("/");

              const formattedSegment =
                segment.charAt(0).toUpperCase() + segment.slice(1);

              return (
                <BreadcrumbItem key={href}>
                  {isLast ? (
                    <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink>{formattedSegment}</BreadcrumbLink>
                  )}
                  {!isLast && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
