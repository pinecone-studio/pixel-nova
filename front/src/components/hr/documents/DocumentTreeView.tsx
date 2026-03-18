"use client";

import { useState, useMemo, useCallback } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiFolder,
  FiFolderPlus,
  FiUser,
} from "react-icons/fi";
import { CiWarning } from "react-icons/ci";

import type { Document, Employee } from "@/lib/types";
import type {
  DocTreeEmployee,
  DocTreePhase,
  DocTreeEvent,
  BreadcrumbPath,
} from "@/lib/documentTree";
import { employeeFolderName, getUrlTtlStatus, getUrlRemainingDays, urlTtlLabel } from "@/lib/documentTree";
import {
  EyeIcon,
  DownloadIcon,
  ReqIcon,
  OnboardIcon,
  ActiveIcon,
  SearchIcon,
} from "@/components/icons";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentTreeViewProps {
  tree: DocTreeEmployee[];
  onPreview: (doc: Document, employee?: Employee) => void;
  onDownload: (doc: Document, employee?: Employee) => void;
  loading?: boolean;
  error?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PHASE_ICONS: Record<string, React.ReactNode> = {
  onboarding: <OnboardIcon className="h-5 w-5 text-[#121316]" />,
  working: <ActiveIcon className="h-5 w-5 text-[#121316]" />,
  offboarding: <CiWarning className="h-5 w-5 text-[#121316]" />,
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function docStatusInfo(doc: Document) {
  const ttlStatus = getUrlTtlStatus(doc);
  const remainingDays = getUrlRemainingDays(doc);
  const label = urlTtlLabel(ttlStatus, remainingDays);

  const colorMap = {
    valid: "text-[#1aba52]",
    expiring: "text-amber-500",
    expired: "text-red-500",
    none: "text-[#77818c]",
  };

  return { label, color: colorMap[ttlStatus], ttlStatus };
}

function nodeId(empId: string, phase?: string, eventKey?: string): string {
  if (eventKey && phase) return `emp-${empId}-${phase}-${eventKey}`;
  if (phase) return `emp-${empId}-${phase}`;
  return `emp-${empId}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Chevron({ open }: { open: boolean }) {
  return open ? (
    <FiChevronDown className="h-4 w-4 shrink-0 text-[#77818c] transition-transform duration-200" />
  ) : (
    <FiChevronRight className="h-4 w-4 shrink-0 text-[#77818c] transition-transform duration-200" />
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-black/12 px-2 py-0.5 text-[12px] text-[#3f4145]">
      {count}
    </span>
  );
}

function DocumentRow({
  doc,
  employee,
  onPreview,
  onDownload,
}: {
  doc: Document;
  employee: Employee;
  onPreview: (doc: Document, employee?: Employee) => void;
  onDownload: (doc: Document, employee?: Employee) => void;
}) {
  const status = docStatusInfo(doc);

  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 pl-16 transition-colors hover:bg-[#fafafa]">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-black/12 bg-white">
          <ReqIcon className="h-4 w-4 text-[#121316]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#121316]">
            {doc.documentName}
          </p>
          <div className="flex items-center gap-2 text-[12px] text-[#3f4145]">
            <span>{formatDate(doc.createdAt)}</span>
            <span className="text-black/20">|</span>
            <span className={status.color}>
              {status.ttlStatus === "expiring" || status.ttlStatus === "expired" ? "⚠ " : ""}
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0">
        <button
          onClick={() => onPreview(doc, employee)}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
          aria-label="Урьдчилж харах">
          <EyeIcon />
        </button>
        <button
          onClick={() => onDownload(doc, employee)}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
          aria-label="Татах">
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
}

function EventLevel({
  event,
  empId,
  phaseKey,
  employee,
  expanded: expandedSet,
  toggle,
  onPreview,
  onDownload,
}: {
  event: DocTreeEvent;
  empId: string;
  phaseKey: string;
  employee: Employee;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onPreview: (doc: Document, employee?: Employee) => void;
  onDownload: (doc: Document, employee?: Employee) => void;
}) {
  const eventKey = `${event.date}_${event.action}`;
  const id = nodeId(empId, phaseKey, eventKey);
  const isOpen = expandedSet.has(id);

  return (
    <div>
      <button
        onClick={() => toggle(id)}
        className="flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 pl-12 text-left transition-colors hover:bg-[#fafafa]">
        <Chevron open={isOpen} />
        <FiFolder className="h-4 w-4 shrink-0 text-[#77818c]" />
        <span className="truncate text-[14px] text-[#121316]">
          {event.label}
        </span>
        <Badge count={event.documents.length} />
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {event.documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              employee={employee}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseLevel({
  phase,
  empId,
  employee,
  expanded: expandedSet,
  toggle,
  onPreview,
  onDownload,
}: {
  phase: DocTreePhase;
  empId: string;
  employee: Employee;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onPreview: (doc: Document, employee?: Employee) => void;
  onDownload: (doc: Document, employee?: Employee) => void;
}) {
  const id = nodeId(empId, phase.key);
  const isOpen = expandedSet.has(id);
  const icon = PHASE_ICONS[phase.key] ?? (
    <FiFolderPlus className="h-5 w-5 text-[#121316]" />
  );

  return (
    <div>
      <button
        onClick={() => toggle(id)}
        className="flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 pl-6 text-left transition-colors hover:bg-[#fafafa]">
        <Chevron open={isOpen} />
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-black/12 bg-white">
          {icon}
        </div>
        <span className="truncate text-[14px] font-medium text-[#121316]">
          {phase.label}
        </span>
        <Badge count={phase.documentCount} />
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {phase.events.map((event) => (
            <EventLevel
              key={`${event.date}_${event.action}`}
              event={event}
              empId={empId}
              phaseKey={phase.key}
              employee={employee}
              expanded={expandedSet}
              toggle={toggle}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeLevel({
  node,
  expanded: expandedSet,
  toggle,
  onPreview,
  onDownload,
}: {
  node: DocTreeEmployee;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onPreview: (doc: Document, employee?: Employee) => void;
  onDownload: (doc: Document, employee?: Employee) => void;
}) {
  const emp = node.employee;
  const id = nodeId(emp.id);
  const isOpen = expandedSet.has(id);
  const folderName = employeeFolderName(emp);

  return (
    <div className="rounded-[24px] border border-black/12 bg-white overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#fafafa]">
        <Chevron open={isOpen} />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-black/12 bg-[#f5f5f5]">
          <FiUser className="h-5 w-5 text-[#121316]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[#121316]">
            {folderName}
          </p>
          <p className="truncate text-[12px] text-[#3f4145]">
            {emp.department} &middot; {emp.jobTitle || emp.level}
          </p>
        </div>
        <Badge count={node.documentCount} />
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-black/12 py-1">
          {node.phases.map((phase) => (
            <PhaseLevel
              key={phase.key}
              phase={phase}
              empId={emp.id}
              employee={emp}
              expanded={expandedSet}
              toggle={toggle}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function Breadcrumb({
  path,
  onNavigate,
}: {
  path: BreadcrumbPath;
  onNavigate: (path: BreadcrumbPath) => void;
}) {
  const segments: { label: string; path: BreadcrumbPath }[] = [
    { label: "Бүх баримтууд", path: {} },
  ];

  if (path.employeeId && path.employeeName) {
    segments.push({
      label: path.employeeName,
      path: { employeeId: path.employeeId, employeeName: path.employeeName },
    });
  }

  if (path.phase && path.phaseLabel) {
    segments.push({
      label: path.phaseLabel,
      path: {
        employeeId: path.employeeId,
        employeeName: path.employeeName,
        phase: path.phase,
        phaseLabel: path.phaseLabel,
      },
    });
  }

  if (path.eventKey && path.eventLabel) {
    segments.push({
      label: path.eventLabel,
      path: {
        employeeId: path.employeeId,
        employeeName: path.employeeName,
        phase: path.phase,
        phaseLabel: path.phaseLabel,
        eventKey: path.eventKey,
        eventLabel: path.eventLabel,
      },
    });
  }

  return (
    <nav className="flex items-center gap-1 text-[12px] text-[#3f4145]">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <FiChevronRight className="h-3 w-3 text-[#77818c]" />}
          {i < segments.length - 1 ? (
            <button
              onClick={() => onNavigate(seg.path)}
              className="rounded px-1 py-0.5 transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]">
              {seg.label}
            </button>
          ) : (
            <span className="px-1 py-0.5 font-medium text-[#121316]">
              {seg.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DocumentTreeView({
  tree,
  onPreview,
  onDownload,
  loading = false,
  error = null,
}: DocumentTreeViewProps) {
  // Expand first employee by default
  const defaultExpanded = useMemo(() => {
    const initial = new Set<string>();
    if (tree.length > 0) {
      initial.add(nodeId(tree[0].employee.id));
    }
    return initial;
  }, [tree]);

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  // Sync default when tree changes
  const [prevTreeKey, setPrevTreeKey] = useState(() =>
    tree.length > 0 ? tree[0].employee.id : "",
  );
  if (tree.length > 0 && tree[0].employee.id !== prevTreeKey) {
    setPrevTreeKey(tree[0].employee.id);
    const next = new Set<string>();
    next.add(nodeId(tree[0].employee.id));
    setExpanded(next);
  }

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Collapse this node and all children
        for (const key of prev) {
          if (key === id || key.startsWith(id + "-")) {
            next.delete(key);
          }
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Compute breadcrumb from deepest expanded path
  const breadcrumb = useMemo<BreadcrumbPath>(() => {
    let deepest: BreadcrumbPath = {};
    let maxDepth = 0;

    for (const key of expanded) {
      const parts = key.split("-");
      // parts: ["emp", empId] or ["emp", empId, phase] or ["emp", empId, phase, eventKey]
      const depth = parts.length;

      if (depth > maxDepth) {
        maxDepth = depth;
        const empId = parts[1];

        const empNode = tree.find((n) => n.employee.id === empId);
        if (!empNode) continue;

        const path: BreadcrumbPath = {
          employeeId: empId,
          employeeName: employeeFolderName(empNode.employee),
        };

        if (parts.length >= 3) {
          const phaseKey = parts[2];
          const phaseNode = empNode.phases.find((p) => p.key === phaseKey);
          if (phaseNode) {
            path.phase = phaseKey;
            path.phaseLabel = phaseNode.label;
          }
        }

        if (parts.length >= 4) {
          const eventKey = parts.slice(3).join("-");
          const phaseNode = empNode.phases.find((p) => p.key === parts[2]);
          if (phaseNode) {
            const eventNode = phaseNode.events.find(
              (e) => `${e.date}_${e.action}` === eventKey,
            );
            if (eventNode) {
              path.eventKey = eventKey;
              path.eventLabel = eventNode.label;
            }
          }
        }

        deepest = path;
      }
    }

    return deepest;
  }, [expanded, tree]);

  const handleBreadcrumbNavigate = useCallback((path: BreadcrumbPath) => {
    const next = new Set<string>();

    if (path.employeeId) {
      next.add(nodeId(path.employeeId));
    }
    if (path.employeeId && path.phase) {
      next.add(nodeId(path.employeeId, path.phase));
    }
    if (path.employeeId && path.phase && path.eventKey) {
      next.add(nodeId(path.employeeId, path.phase, path.eventKey));
    }

    setExpanded(next);
  }, []);

  // Search
  const [search, setSearch] = useState("");

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;

    const q = search.toLowerCase();
    return tree.filter((emp) => {
      const empMatch = [
        emp.employee.firstName,
        emp.employee.lastName,
        emp.employee.employeeCode,
        emp.employee.department,
      ].some((v) => v.toLowerCase().includes(q));

      if (empMatch) return true;

      return emp.phases.some((phase) =>
        phase.events.some((event) =>
          event.documents.some((doc) =>
            doc.documentName.toLowerCase().includes(q),
          ),
        ),
      );
    });
  }, [tree, search]);

  // -- Render --

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[24px] border border-black/12 bg-white p-6">
          <div className="flex flex-col gap-3">
            <div className="h-4 w-56 rounded-full skeleton" />
            <div className="h-4 w-80 rounded-full skeleton" />
            <div className="h-4 w-72 rounded-full skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center text-[14px] text-red-500">
        {error}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="rounded-[24px] border border-black/12 bg-white p-12 text-center text-[14px] text-[#3f4145]">
        Баримт олдсонгүй
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb path={breadcrumb} onNavigate={handleBreadcrumbNavigate} />

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Хайх..."
            className="h-9 w-full rounded-[10px] border border-black/12 bg-white pl-9 pr-3 text-[14px] text-[#121316] placeholder:text-[#77818c] outline-none transition-colors focus:border-[#121316]/30 sm:w-56"
          />
        </div>
      </div>

      {/* Tree */}
      {filteredTree.length === 0 ? (
        <div className="rounded-[24px] border border-black/12 bg-white p-12 text-center text-[14px] text-[#3f4145]">
          Баримт олдсонгүй
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTree.map((empNode) => (
            <EmployeeLevel
              key={empNode.employee.id}
              node={empNode}
              expanded={expanded}
              toggle={toggle}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentTreeView;
