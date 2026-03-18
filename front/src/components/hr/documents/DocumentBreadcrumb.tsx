"use client";

import { FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface DocumentBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const DocumentBreadcrumb = ({ items }: DocumentBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] py-3 px-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <FiChevronRight className="text-[#3f4145]/50 w-3.5 h-3.5 shrink-0" />
            )}

            {isLast ? (
              <span className="text-[#121316] font-medium max-w-[160px] truncate inline-block">
                {item.label}
              </span>
            ) : (
              <span
                className="text-[#3f4145] hover:text-[#121316] cursor-pointer transition-colors max-w-[160px] truncate inline-block"
                onClick={item.onClick}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};
