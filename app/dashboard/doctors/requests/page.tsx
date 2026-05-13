"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  ActionButton,
  Pagination,
  SectionCard,
  MetricCard,
  LoadingSpinner,
  StarRating,
} from "@/components/ui";
import { Download, Plus, ShieldCheck, X, Trash2 } from "lucide-react";
import {
  fetchPendingDoctors,
  approveDoctor,
  rejectDoctor,
  setPendingPage,
} from "@/store/slices/pendingDoctorsSlice";
import { useRouter } from "next/navigation";
import { deleteDoctor, deleteDoctors } from "@/store/slices/allDoctorsSlice";

export default function DoctorRequestsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, loading, pagination } = useAppSelector((s) => s.pendingDoctors);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const getDoctorId = (d: any) => d?.id || d?._id || "";

  const [deleteMode, setDeleteMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [showConfirm, setShowConfirm] = useState(false);
const [deleting, setDeleting] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    doctorId: string | null;
  }>({
    open: false,
    doctorId: null,
  });
  const [rejections, setRejections] = useState<
    { step: number; reason: string }[]
  >([{ step: 1, reason: "" }]);
  const [rejecting, setRejecting] = useState(false);

  const STEPS = [
  { label: "Step 1 — Basic Info", value: 1 },
  { label: "Step 2 — Clinic Details", value: 2 },
  { label: "Step 3 — Services & Availability", value: 3 },
  { label: "Step 4 — Account Details", value: 4 },
  { label: "Step 5 — Documents", value: 5 },
];

  const handleRejectClick = (id: string) => {
    setRejections([{ step: 1, reason: "" }]);
    setRejectModal({ open: true, doctorId: id });
  };

  const addRejection = () => {
    setRejections((prev) => [...prev, { step: 1, reason: "" }]);
  };

  const removeRejection = (index: number) => {
    setRejections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRejection = (
    index: number,
    field: "step" | "reason",
    value: any,
  ) => {
    setRejections((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.doctorId) return;
    const valid = rejections.every((r) => r.reason.trim());
    if (!valid) return;
    setRejecting(true);
    try {
      await dispatch(rejectDoctor({ id: rejectModal.doctorId, rejections }));
    } finally {
      await dispatch(fetchPendingDoctors(pagination.page));
      setRejecting(false);
      setRejectModal({ open: false, doctorId: null });
    }
  };

const handleView = (d: any) => {
  const doctorId = getDoctorId(d);
  if (!doctorId) return;
  router.push(`/dashboard/doctors/requests/${encodeURIComponent(doctorId)}`);
};


const handleSelectOne = (id: string) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  );
};

const handleSelectAll = () => {
  if (selectedIds.length === paginated.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(paginated.map((d: any) => getDoctorId(d)));
  }
};

const handleDeleteSelected = async () => {
  setDeleting(true);
  if (selectedIds.length === 1) {
    await dispatch(deleteDoctor(selectedIds[0]));
  } else {
    await dispatch(deleteDoctors(selectedIds));
  }
  setSelectedIds([]);
  setShowConfirm(false);
  setDeleteMode(false);
  setDeleting(false);
  const nextPage = paginated.length === selectedIds.length && pagination.page > 1
    ? pagination.page - 1
    : pagination.page;
  dispatch(setPendingPage(nextPage));
  dispatch(fetchPendingDoctors(nextPage));
};
  

  useEffect(() => {
    dispatch(fetchPendingDoctors(pagination.page));
  }, [dispatch, pagination.page]);

  const paginated = list;

  const columns = [
    {
  key: "select",
  label: deleteMode ? (
    <input
      type="checkbox"
      checked={paginated.length > 0 && selectedIds.length === paginated.length}
      onChange={handleSelectAll}
      className="w-4 h-4 accent-red-500 cursor-pointer"
    />
  ) : null,
  render: (d: any) => deleteMode ? (
    <input
      type="checkbox"
      checked={selectedIds.includes(getDoctorId(d))}
      onChange={() => handleSelectOne(getDoctorId(d))}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 accent-red-500 cursor-pointer"
    />
  ) : null,
},
    {
      key: "name",
      label: "User Name", // Changed from Doctor Name
      render: (d: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {d.name?.charAt(0)}
          </div>
          <div>
            <p className="text-text-primary font-medium">{d.name}</p>
            <p className="text-text-muted text-xs">{d.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (d: any) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider"> {/* Changed color */}
          {d.specialization}
        </span>
      ),
    },
    { key: "clinic", label: "Clinic" },
    {
      key: "rating",
      label: "Rating",
      render: (d: any) => <StarRating rating={d.rating ?? 0} />,
    },
    {
      key: "verificationStatus",
      label: "Verification",
      render: (d: any) => <StatusBadge status={d.verificationStatus} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (d: any) => (
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButton
            label="View"
            onClick={() => handleView(d)}
            variant="secondary"
            size="xs"
          />
          {d.verificationStatus === "pending" && (
            <>
              <button
                onClick={async () => {
                  const id = getDoctorId(d);
                  setApprovingId(id);
                  try {
                    await dispatch(approveDoctor(id));
                  } finally {
                    await dispatch(fetchPendingDoctors(pagination.page));
                    setApprovingId(null);
                  }
                }}
                disabled={approvingId === getDoctorId(d)}
                className="h-6 px-2 rounded text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white flex items-center gap-1 transition"
              >
                {approvingId === getDoctorId(d) ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Approving...
                  </>
                ) : "Approve"}
              </button>
              <ActionButton
                label="Reject"
                onClick={() => handleRejectClick(getDoctorId(d))}
                variant="danger"
                size="xs"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const summaryCards = [
    {
      label: "Pending Requests",
      value: list.length,
      change: 0, // Placeholder, actual change logic would be more complex
      icon: <ShieldCheck size={16} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="User Verification Requests" // Changed from Doctor Requests
          subtitle="Manage pending user verification requests." // Changed from doctor verification requests
          actions={
  deleteMode ? (
    <div className="flex items-center gap-2">
      {selectedIds.length > 0 && (
        <button
          onClick={() => setShowConfirm(true)}
          className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition"
        >
          <Trash2 size={14} />
          Delete {selectedIds.length} user request{selectedIds.length > 1 ? "s" : ""} {/* Changed text */}
        </button>
      )}
      <button
        onClick={() => { setDeleteMode(false); setSelectedIds([]); }}
        className="h-9 px-3 rounded-lg border border-[#333] text-gray-400 text-sm hover:text-white transition"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={() => setDeleteMode(true)}
      className="h-9 px-4 rounded-lg border border-red-600 text-red-500 text-sm font-medium flex items-center gap-2 hover:bg-red-600 hover:text-white transition"
    >
      <Trash2 size={14} />
      Delete
    </button>
  )
}
         />

        <SectionCard noPadding className="mb-6">
          <div className="p-4 border-b border-border-subtle">
            <p className="text-text-muted text-sm"> 
              Showing all pending user verification requests
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginated}
                keyExtractor={(d) => getDoctorId(d)}
                emptyMessage="No user requests found matching your filters" // Changed text
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-text-muted text-xs">
                  Page{" "}
                  <span className="text-text-primary font-medium">{pagination.page}</span>{" "}
                  of{" "}
                  <span className="text-text-primary font-medium">{pagination.totalPages}</span>
                  {" "}&mdash;{" "}
                  <span className="text-text-primary font-medium">{pagination.total}</span> total
                </p>
                <Pagination
                  page={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(p) => dispatch(setPendingPage(p))}
                />
              </div>
            </>
          )}
        </SectionCard>

        <div className="grid grid-cols-3 gap-4">
          {summaryCards.map((c) => (
            <MetricCard key={c.label} {...c} />
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="fixed top-0 right-0 w-[400px] h-full bg-black border-l border-gray-800 p-4 overflow-y-auto z-50">
          <button onClick={() => setSelectedDoctor(null)}>Close</button>

          <h2 className="text-lg font-bold mb-4">User Details</h2> {/* Changed title */}

          <p>
            <b>Name:</b> {selectedDoctor.name}
          </p>
          <p>
            <b>Email:</b> {selectedDoctor.email}
          </p>
          <p>
            <b>Phone:</b> {selectedDoctor.phone}
          </p>

          <h3 className="mt-4 font-semibold">Clinic</h3>
          <p>{selectedDoctor.fullData?.clinic?.clinicName}</p>
          <p>{selectedDoctor.fullData?.clinic?.address}</p>

          <h3 className="mt-4 font-semibold">Documents</h3>
          <a
            href={selectedDoctor.fullData?.documents?.medicalLicense}
            target="_blank"
            rel="noreferrer"
          >
            Verification Document {/* Changed text */}
          </a>

          <h3 className="mt-4 font-semibold">Bank</h3>
          <p>{selectedDoctor.fullData?.bankDetails?.accountNumber}</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-default rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text-primary font-semibold text-lg"> 
                Reject User Request
              </h2>
              <button
                onClick={() => setRejectModal({ open: false, doctorId: null })}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              Add one or more rejection reasons for the user's verification request.
            </p>

            {/* Rejection rows */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {rejections.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  {/* Step dropdown */}
                  <select
                    value={r.step}
                    onChange={(e) =>
                      updateRejection(i, "step", Number(e.target.value))
                    }
                    className="h-9 rounded-lg border border-border-default bg-bg-card text-text-primary text-sm px-2 focus:outline-none focus:border-blue-500/50 shrink-0" // Changed color
                    style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
                  >
                    {STEPS.map((s) => (
                      <option
                        key={s.value}
                        value={s.value}
                        style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
                      >
                        {s.label}
                      </option>
                    ))}
                  </select>

                  {/* Reason input */}
                  <input
  type="text"
  value={r.reason}
  onChange={(e) => updateRejection(i, "reason", e.target.value)}
  placeholder="Reason for rejection..."
  className="flex-1 h-9 rounded-lg border border-border-default text-sm px-3 focus:outline-none focus:border-blue-500/50 transition-colors" // Changed color
  style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
/>

                  {/* Remove button */}
                  {rejections.length > 1 && (
                    <button
                      onClick={() => removeRejection(i)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-default text-text-muted hover:text-red-400 hover:border-red-400/40 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add more */}
            <button
              onClick={addRejection}
              className="mt-3 text-sm text-blue-500 hover:underline flex items-center gap-1" // Changed color
            >
              + Add another reason
            </button>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setRejectModal({ open: false, doctorId: null })}
                className="h-9 px-4 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={
                  rejections.every((r) => !r.reason.trim()) || rejecting
                }
                className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
              >
                {rejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirm && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-[90%] max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Delete {selectedIds.length} user request{selectedIds.length > 1 ? "s" : ""}?</h2> {/* Changed text */}
          <p className="text-gray-400 text-sm">This will permanently remove the user request. This action cannot be undone.</p> {/* Changed text */}
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 rounded-lg border border-[#333] text-gray-400 text-sm hover:text-white transition"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteSelected}
          disabled={deleting}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}
