import { SectionPill, sectionLabel } from "./helpers";
import { DocumentRow, NewEmployeeRow, StatusRow } from "./rows";
import type {
  AuditView,
  DocumentReview,
  EmployeeRequest,
  StatusUpdate,
} from "./types";

export function AuditSectionContent({
  selectedView,
  selectedList,
  filteredEmployees,
  filteredDocuments,
  filteredStatusUpdates,
  onEmployeeOpen,
  onDocumentOpen,
}: {
  selectedView: AuditView;
  selectedList: number;
  filteredEmployees: EmployeeRequest[];
  filteredDocuments: DocumentReview[];
  filteredStatusUpdates: StatusUpdate[];
  onEmployeeOpen: (entry: EmployeeRequest) => void;
  onDocumentOpen: (entry: DocumentReview) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        <h2 className="text-[22px] font-semibold text-white">
          {sectionLabel(selectedView)}
        </h2>
        <SectionPill count={selectedList} />
      </div>

      {selectedView === "newEmployee" ? (
        <div className="flex flex-col gap-4">
          {filteredEmployees.map((entry) => (
            <NewEmployeeRow
              key={entry.id}
              entry={entry}
              onOpen={onEmployeeOpen}
            />
          ))}
        </div>
      ) : null}

      {selectedView === "documentReview" ? (
        <div className="flex flex-col">
          {filteredDocuments.map((entry) => (
            <DocumentRow
              key={entry.id}
              entry={entry}
              onOpen={onDocumentOpen}
            />
          ))}
        </div>
      ) : null}

      {selectedView === "statusUpdate" ? (
        <div className="flex flex-col gap-4">
          {filteredStatusUpdates.map((entry) => (
            <StatusRow key={entry.id} entry={entry} />
          ))}
        </div>
      ) : null}
    </>
  );
}
