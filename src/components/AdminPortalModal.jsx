import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Shield, 
  X, 
  Users, 
  Building, 
  Search, 
  Database, 
  FileSpreadsheet, 
  Trash2, 
  FolderOpen, 
  Trash, 
  Award, 
  FileUp, 
  UploadCloud,
  ArrowLeft, 
  Download, 
  FileText, 
  ChevronRight,
  Filter,
  UserCheck,
  UserPlus,
  User,
  GraduationCap,
  CheckCircle2,
  Calendar,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  RotateCcw,
  Folder,
  FolderPlus,
  Edit3,
  MoreVertical,
  Layers,
  Scissors,
  Copy,
  Clipboard,
  Plus,
  Clock,
  Settings
} from 'lucide-react';
import CertificateDumpUpload from './CertificateDumpUpload';
import CertificateGenerator from './CertificateGenerator';
import MasterRollDump from './MasterRollDump';

export default function AdminPortalModal({
  isOpen,
  onClose,
  records,
  certificates,
  masterDump = [],
  portalSettings = {},
  onSavePortalSettings,
  onDeleteRecord,
  onVerifyRecord,
  onAddRecord,
  onClearAllRecords,
  onLoadSampleData,
  onSaveCertificates,
  onDeleteCertificate,
  onSaveMasterDump,
  onDeleteMasterEntry,
  onClearAllMasterDump,
  onLoadSampleMasterData,
  showToast
}) {
  const [isFormSettingsModalOpen, setIsFormSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('colleges');
  const [newCollegeInput, setNewCollegeInput] = useState('');
  const [newWorkshopInput, setNewWorkshopInput] = useState('');
  const [newDepartmentInput, setNewDepartmentInput] = useState('');

  const currentColleges = portalSettings.colleges || [];
  const currentWorkshops = portalSettings.workshops || [];
  const currentDepartments = portalSettings.departments || [];

  const handleAddCollege = (e) => {
    e.preventDefault();
    const val = newCollegeInput.trim();
    if (!val) return;
    if (currentColleges.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
      if (showToast) showToast('College already exists in list', 'info');
      return;
    }
    const updated = [...currentColleges, val];
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, colleges: updated });
    }
    setNewCollegeInput('');
    if (showToast) showToast(`Added "${val}" to Colleges list`, 'success');
  };

  const handleDeleteCollege = (collegeName) => {
    const updated = currentColleges.filter(c => c !== collegeName);
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, colleges: updated });
    }
    if (showToast) showToast(`Removed "${collegeName}"`, 'info');
  };

  const handleAddWorkshop = (e) => {
    e.preventDefault();
    const val = newWorkshopInput.trim();
    if (!val) return;
    if (currentWorkshops.map(w => w.toLowerCase()).includes(val.toLowerCase())) {
      if (showToast) showToast('Workshop title already exists in list', 'info');
      return;
    }
    const updated = [...currentWorkshops, val];
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, workshops: updated });
    }
    setNewWorkshopInput('');
    if (showToast) showToast(`Added "${val}" to Workshop titles list`, 'success');
  };

  const handleDeleteWorkshop = (workshopTitle) => {
    const updated = currentWorkshops.filter(w => w !== workshopTitle);
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, workshops: updated });
    }
    if (showToast) showToast(`Removed "${workshopTitle}"`, 'info');
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const val = newDepartmentInput.trim();
    if (!val) return;
    if (currentDepartments.map(d => d.toLowerCase()).includes(val.toLowerCase())) {
      if (showToast) showToast('Department already exists in list', 'info');
      return;
    }
    const updated = [...currentDepartments, val];
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, departments: updated });
    }
    setNewDepartmentInput('');
    if (showToast) showToast(`Added "${val}" to Departments list`, 'success');
  };

  const handleDeleteDepartment = (deptName) => {
    const updated = currentDepartments.filter(d => d !== deptName);
    if (onSavePortalSettings) {
      onSavePortalSettings({ ...portalSettings, departments: updated });
    }
    if (showToast) showToast(`Removed "${deptName}"`, 'info');
  };

  const [adminTab, setAdminTab] = useState(() => {
    try {
      return sessionStorage.getItem('ranbidge_admin_tab') || 'registrations';
    } catch (e) {
      return 'registrations';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Column Filters & Sort State
  const [columnFilters, setColumnFilters] = useState({
    id: '',
    fullName: '',
    rollNumber: '',
    college: [],
    passoutYear: [],
    department: [],
    workshopName: [],
    workshopDate: []
  });

  const [sortConfig, setSortConfig] = useState({ col: null, dir: null });
  const [activePopover, setActivePopover] = useState(null); // 'id' | 'fullName' | 'college' | 'rollNumber' | 'passoutYear' | 'department' | 'workshopName' | 'workshopDate' | null
  const [popoverSearch, setPopoverSearch] = useState('');

  // Selected College Details
  const [selectedCollegeName, setSelectedCollegeName] = useState(null);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');

  // Users Directory Inspector Modal State
  const [isUsersDirectoryOpen, setIsUsersDirectoryOpen] = useState(() => {
    try {
      return sessionStorage.getItem('ranbidge_users_dir_open') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [userDirSearchQuery, setUserDirSearchQuery] = useState('');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('');

  // Persist Admin Tab and Users Directory Modal open state
  useEffect(() => {
    try {
      sessionStorage.setItem('ranbidge_admin_tab', adminTab);
    } catch (e) {}
  }, [adminTab]);

  useEffect(() => {
    try {
      sessionStorage.setItem('ranbidge_users_dir_open', isUsersDirectoryOpen ? 'true' : 'false');
    } catch (e) {}
  }, [isUsersDirectoryOpen]);

  const [selectedPreviewCert, setSelectedPreviewCert] = useState(null);
  const [selectedGeneratedCertRecord, setSelectedGeneratedCertRecord] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Folder File Upload Ref & Direct Upload Handler
  const folderFileInputRef = useRef(null);

  const processAndUploadFiles = (filesList, targetFolder = openedFolderPage) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;

    const folderNameStr = targetFolder ? targetFolder.name : 'Root Dashboard';
    const folderIdStr = targetFolder ? targetFolder.id : null;

    const newCerts = [];
    let completed = 0;

    const parseMeta = (filename) => {
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
      const parts = nameWithoutExt.split(/[-_]/);
      let rollNumber = '';
      let studentName = '';
      if (parts.length >= 1 && /^[A-Z0-9]+$/i.test(parts[0])) {
        rollNumber = parts[0].toUpperCase();
        studentName = parts.slice(1).join(' ').replace(/\s+/g, ' ').trim();
      } else {
        studentName = nameWithoutExt.replace(/[-_]/g, ' ').trim();
      }
      return { rollNumber, studentName };
    };

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const meta = parseMeta(file.name);
        const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        const isPdf = fileExt === '.pdf';
        const isImg = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExt);
        const fileType = isPdf ? 'pdf' : isImg ? 'image' : 'document';

        newCerts.push({
          id: 'cert-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          fileName: file.name,
          fileType: fileType,
          fileData: evt.target.result,
          rollNumber: meta.rollNumber || 'N/A',
          studentName: meta.studentName || file.name,
          college: folderNameStr,
          workshopName: folderNameStr,
          folderId: folderIdStr,
          folderName: folderNameStr,
          uploadedAt: new Date().toLocaleString()
        });

        completed++;
        if (completed === files.length) {
          if (onSaveCertificates && newCerts.length > 0) {
            onSaveCertificates(newCerts);
          }
          if (showToast) {
            showToast(`📤 Stored ${files.length} certificate file(s) inside "${folderNameStr}"!`);
          }
          if (folderFileInputRef.current) {
            folderFileInputRef.current.value = '';
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingOver(false);
  };

  const handleDropFiles = (e, targetFolder = openedFolderPage) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processAndUploadFiles(files, targetFolder);
    }
  };

  const handleDirectFolderUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processAndUploadFiles(files, openedFolderPage);
    }
  };

  // File Explorer Custom Folders & Directory Drive State
  const [customFolders, setCustomFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('ranbidge_custom_folders');
      return saved ? JSON.parse(saved) : [
        { id: 'f-1', name: 'RANBIDGE Certificate Center' },
        { id: 'f-2', name: 'Company Documents' },
        { id: 'f-3', name: 'Company Posters' },
        { id: 'f-4', name: 'IDE BootCamp Files' },
        { id: 'f-5', name: 'Church project' },
        { id: 'f-6', name: 'Demo Python Cource' },
        { id: 'f-7', name: 'LMS Data' },
        { id: 'f-8', name: 'RANBIDGE-Verification-Portal' }
      ];
    } catch (e) {
      return [
        { id: 'f-1', name: 'RANBIDGE Certificate Center' },
        { id: 'f-2', name: 'Company Documents' }
      ];
    }
  });

  // Deleted Folders List State (persisted to localStorage)
  const [deletedFolderNames, setDeletedFolderNames] = useState(() => {
    try {
      const saved = localStorage.getItem('ranbidge_deleted_folders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync deleted folders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ranbidge_deleted_folders', JSON.stringify(deletedFolderNames));
    } catch (e) {}
  }, [deletedFolderNames]);

  // Folder Multi-Selection & Range Navigation State
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [anchorFolderIndex, setAnchorFolderIndex] = useState(null);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(null);

  // Student Records Selection State (for one-by-one or select-all batch actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Selected Student Detail Modal State
  const [viewingStudentDetail, setViewingStudentDetail] = useState(null);

  // Safe timestamp & value formatters to prevent React object-as-child crashes
  const formatTimestamp = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (val && typeof val.toDate === 'function') {
      try { return val.toDate().toLocaleString(); } catch (e) {}
    }
    if (val && typeof val.seconds === 'number') {
      try { return new Date(val.seconds * 1000).toLocaleString(); } catch (e) {}
    }
    if (val instanceof Date) return val.toLocaleString();
    return 'N/A';
  };

  const safeVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val || fallback;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      if (val.seconds !== undefined) return formatTimestamp(val);
      try { return JSON.stringify(val); } catch (e) { return fallback; }
    }
    return String(val) || fallback;
  };

  // Settings Popover State
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);

  // Opened Dedicated Folder Page State
  const [openedFolderPage, setOpenedFolderPage] = useState(null);
  const [openedFolderTab, setOpenedFolderTab] = useState('records'); // 'records' | 'certificates'

  // Download single certificate image helper
  const downloadSingleCertificate = (rec) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1200, 850);

      // Outer Dark Border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, 1160, 810);

      // Inner Gold Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, 32, 1136, 786);

      // Header Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RANBIDGE SERVICE PRIVATE LIMITED', 600, 110);

      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CERTIFICATE OF PARTICIPATION', 600, 160);

      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText('This is proudly presented to', 600, 220);

      // Participant Name
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 44px serif';
      ctx.fillText(rec.fullName || 'Participant Name', 600, 290);

      // Line below name
      ctx.beginPath();
      ctx.moveTo(350, 310);
      ctx.lineTo(850, 310);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Details Text
      ctx.fillStyle = '#334155';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Roll Number: ${rec.rollNumber || 'N/A'} | Department: ${rec.department || 'N/A'}`, 600, 360);
      ctx.fillText(`College: ${rec.college || 'N/A'}`, 600, 400);

      ctx.fillText('for successfully completing the technical workshop on', 600, 460);

      // Workshop Name
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(rec.workshopName || 'Specialized Technical Workshop', 600, 520);

      // Date & ID
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Date: ${rec.workshopDate || new Date().toLocaleDateString()} | Verification ID: ${rec.id || 'REG-RANBIDGE'}`, 600, 570);

      // Footer / Seal & Signature
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RANBIDGE VERIFIED', 100, 720);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Authorized Signatory', 100, 745);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('OFFICIAL CERTIFICATE', 1100, 720);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Verified via RANBIDGE Portal', 1100, 745);

      // Convert to image link and download
      const link = document.createElement('a');
      link.download = `${(rec.fullName || 'Student').replace(/\s+/g, '_')}_${rec.rollNumber || 'Cert'}_RANBIDGE_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating certificate image for download:', err);
    }
  };

  // Batch Certificate Download
  const handleBulkDownloadCertificates = () => {
    if (selectedStudentIds.length === 0) {
      if (showToast) showToast('⚠️ Please select at least one student record first!');
      return;
    }

    const allRecordsMap = new Map();
    records.forEach(r => allRecordsMap.set(r.id, r));

    const targetList = selectedStudentIds.map(id => allRecordsMap.get(id)).filter(Boolean);

    if (targetList.length === 0) {
      if (showToast) showToast('No valid records found for selected IDs');
      return;
    }

    targetList.forEach((rec, idx) => {
      setTimeout(() => {
        downloadSingleCertificate(rec);
      }, idx * 350);
    });

    if (showToast) {
      showToast(`Downloading ${targetList.length} student certificate(s)...`);
    }
  };

  // Batch Verify & Send Certificates to User Portal
  const handleBulkApproveAndSend = async () => {
    if (selectedStudentIds.length === 0) {
      if (showToast) showToast('⚠️ Please select at least one student record first!');
      return;
    }

    let count = 0;
    for (const id of selectedStudentIds) {
      if (onVerifyRecord) {
        await onVerifyRecord(id);
        count++;
      }
    }

    if (showToast) {
      showToast(`✅ Approved & Sent ${count} certificate(s) to User Download Portal!`);
    }
  };

  // Batch Reject / Remove Selected Student Records
  const handleBulkReject = async () => {
    if (selectedStudentIds.length === 0) {
      if (showToast) showToast('⚠️ Please select at least one student record first!');
      return;
    }

    let count = 0;
    for (const id of selectedStudentIds) {
      if (onDeleteRecord) {
        await onDeleteRecord(id);
        count++;
      }
    }

    setSelectedStudentIds([]);
    if (showToast) {
      showToast(`❌ Rejected & Removed ${count} selected student record(s)!`);
    }
  };

  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Create Workshop Form Modal State
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    college: '',
    category: 'Workshop',
    department: 'CSE',
    date: new Date().toISOString().split('T')[0],
    duration: '1 Day (8 Hours)',
    trainer: 'RANBIDGE Senior Engineer',
    description: ''
  });

  // Add Registered Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({
    fullName: '',
    rollNumber: '',
    college: '',
    department: 'Computer Science Engineering',
    passoutYear: '2026',
    workshopName: '',
    isVerified: true
  });

  // Import Verified Students Bulk Modal State
  const [isImportVerifiedModalOpen, setIsImportVerifiedModalOpen] = useState(false);
  const [importVerifiedText, setImportVerifiedText] = useState('');

  // Added Colleges Directory Modal State
  const [isCollegesDirectoryModalOpen, setIsCollegesDirectoryModalOpen] = useState(false);
  const [collegeSearchInput, setCollegeSearchInput] = useState('');

  // Folder Clipboard (Cut / Copy / Paste) State
  const [folderClipboard, setFolderClipboard] = useState({
    folders: [], // array of folder objects to cut/copy
    mode: null // 'cut' | 'copy' | null
  });

  // Right-Click Context Menu & Rename State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folder: null });
  const [renameModal, setRenameModal] = useState({ isOpen: false, folder: null, newName: '' });

  // Dynamic Dashboard Folders List (Custom Admin Folders + Colleges + Workshops - Filtered by Deleted Folders)
  const allFoldersList = useMemo(() => {
    const deletedSet = new Set(deletedFolderNames.map(n => n.toLowerCase()));

    const collegeMap = {};
    records.forEach(r => {
      const col = r.college ? r.college.trim() : 'General';
      if (!deletedSet.has(col.toLowerCase())) {
        collegeMap[col] = (collegeMap[col] || 0) + 1;
      }
    });

    const collegeFolders = Object.keys(collegeMap).map(colName => ({
      id: `col-${colName}`,
      name: colName,
      type: 'college',
      count: collegeMap[colName]
    }));

    const workshopMap = {};
    records.forEach(r => {
      const ws = r.workshopName ? r.workshopName.trim() : null;
      if (ws && !deletedSet.has(ws.toLowerCase())) {
        workshopMap[ws] = (workshopMap[ws] || 0) + 1;
      }
    });

    const workshopFolders = Object.keys(workshopMap).map(wsName => ({
      id: `ws-${wsName}`,
      name: wsName,
      type: 'workshop',
      count: workshopMap[wsName]
    }));

    // Only display root level custom folders in Root Dashboard grid
    const userFolders = customFolders
      .filter(f => !f.parentId && !deletedSet.has(f.name.toLowerCase()) && !deletedSet.has(f.id.toLowerCase()))
      .map(f => ({
        id: f.id,
        name: f.name,
        type: 'custom',
        count: records.filter(r => r.college === f.name || r.workshopName === f.name).length || 0
      }));

    const combined = [...userFolders];
    collegeFolders.forEach(cf => {
      if (!combined.some(item => item.name.toLowerCase() === cf.name.toLowerCase())) {
        combined.push(cf);
      }
    });
    workshopFolders.forEach(wf => {
      if (!combined.some(item => item.name.toLowerCase() === wf.name.toLowerCase())) {
        combined.push(wf);
      }
    });

    return combined.filter(item => !deletedSet.has(item.name.toLowerCase()) && !deletedSet.has(item.id.toLowerCase()));
  }, [records, customFolders, deletedFolderNames]);

  const handleOpenAddStudentModal = (targetFolder = null) => {
    const parentFolder = targetFolder || openedFolderPage || (contextMenu.folder ? contextMenu.folder : null);
    const folderName = parentFolder ? parentFolder.name : (selectedCollegeName || '');
    const isCollegeType = parentFolder && parentFolder.type === 'college';
    const isWorkshopType = parentFolder && parentFolder.type === 'workshop';

    setAddStudentForm({
      fullName: '',
      rollNumber: '',
      college: isCollegeType ? folderName : (folderName || 'RANBIDGE Partnered Institution'),
      department: 'Computer Science Engineering',
      passoutYear: '2026',
      workshopName: isWorkshopType ? folderName : (folderName || 'RANBIDGE Verification Workshop'),
      isVerified: true
    });
    setIsAddStudentModalOpen(true);
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
  };

  const handleSaveAddStudent = async (e) => {
    e.preventDefault();
    if (!addStudentForm.fullName.trim() || !addStudentForm.rollNumber.trim()) {
      if (showToast) showToast('⚠️ Student Full Name and Roll Number are required!');
      return;
    }

    const newRecord = {
      id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
      fullName: addStudentForm.fullName.trim(),
      rollNumber: addStudentForm.rollNumber.trim().toUpperCase(),
      college: addStudentForm.college.trim() || 'RANBIDGE Partnered Institution',
      department: addStudentForm.department.trim() || 'CSE',
      passoutYear: addStudentForm.passoutYear.trim() || '2026',
      workshopName: addStudentForm.workshopName.trim() || 'RANBIDGE Verification',
      verificationStatus: addStudentForm.isVerified ? 'verified' : 'pending',
      verifiedAt: addStudentForm.isVerified ? new Date().toLocaleString() : null,
      submittedAt: new Date().toLocaleString(),
      timestamp: Date.now()
    };

    if (onAddRecord) {
      await onAddRecord(newRecord);
    }

    if (addStudentForm.isVerified && onVerifyRecord) {
      await onVerifyRecord(newRecord.id);
    }

    setIsAddStudentModalOpen(false);
    if (showToast) showToast(`✅ Added registered student data for ${newRecord.fullName}!`);
  };

  const handleOpenImportVerifiedModal = (targetFolder = null) => {
    const parentFolder = targetFolder || openedFolderPage || (contextMenu.folder ? contextMenu.folder : null);
    const folderName = parentFolder ? parentFolder.name : (selectedCollegeName || 'RANBIDGE Workshop');
    setImportVerifiedText(`23471A1201, Aarav Sharma, ${folderName}, CSE, 2026\n23471A1202, Priya Ananth, ${folderName}, ECE, 2027`);
    setIsImportVerifiedModalOpen(true);
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
  };

  const handleConfirmImportVerified = async (e) => {
    e.preventDefault();
    if (!importVerifiedText.trim()) return;

    const lines = importVerifiedText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parentFolder = openedFolderPage || (contextMenu.folder ? contextMenu.folder : null);
    const defaultName = parentFolder ? parentFolder.name : 'RANBIDGE Institution';

    let count = 0;
    const newMasterEntries = [];
    const newCerts = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const parts = line.split(',').map(p => p.trim());
      const rollNumber = parts[0] ? parts[0].toUpperCase() : `ROLL-${Date.now()}-${idx}`;
      const fullName = parts[1] || `Verified Student ${idx + 1}`;
      const college = parts[2] || defaultName;
      const department = parts[3] || 'CSE';
      const passoutYear = parts[4] || '2026';
      const workshopName = parts[5] || defaultName;

      const newRecord = {
        id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
        fullName,
        rollNumber,
        college,
        department,
        passoutYear,
        workshopName,
        verificationStatus: 'verified',
        verifiedAt: new Date().toLocaleString(),
        submittedAt: new Date().toLocaleString(),
        timestamp: Date.now() + idx
      };

      if (onAddRecord) {
        await onAddRecord(newRecord);
      }

      newMasterEntries.push({
        id: 'DUMP-' + rollNumber,
        rollNumber,
        fullName,
        college,
        department,
        passoutYear,
        workshopName,
        addedAt: new Date().toLocaleString()
      });

      newCerts.push({
        id: 'CERT-' + rollNumber,
        fileName: `${fullName}_Certificate.pdf`,
        rollNumber,
        studentName: fullName,
        college,
        workshopName,
        issueDate: new Date().toISOString().split('T')[0],
        downloadUrl: '#',
        fileSize: '245 KB',
        verificationStatus: 'verified',
        uploadedAt: new Date().toLocaleString()
      });

      count++;
    }

    if (onSaveMasterDump && newMasterEntries.length > 0) {
      await onSaveMasterDump(newMasterEntries);
    }

    if (onSaveCertificates && newCerts.length > 0) {
      await onSaveCertificates(newCerts);
    }

    setIsImportVerifiedModalOpen(false);
    if (showToast) showToast(`🎉 Successfully imported and verified ${count} student record(s)!`);
  };

  const handleOpenCreateWorkshop = (targetFolder = null) => {
    const parentFolder = targetFolder || openedFolderPage || (contextMenu.folder ? contextMenu.folder : null);
    setWorkshopForm({
      title: '',
      college: parentFolder ? parentFolder.name : (selectedCollegeName || ''),
      category: 'Workshop',
      department: 'CSE',
      date: new Date().toISOString().split('T')[0],
      duration: '1 Day (8 Hours)',
      trainer: 'RANBIDGE Senior Engineer',
      description: ''
    });
    setIsWorkshopModalOpen(true);
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
  };

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    if (!workshopForm.title.trim()) return;

    const workshopName = workshopForm.title.trim();
    const parentFolder = openedFolderPage || (contextMenu.folder ? contextMenu.folder : null);
    
    const folder = {
      id: 'ws-' + Date.now(),
      name: workshopName,
      type: 'workshop',
      parentId: parentFolder ? parentFolder.id : null,
      parentName: parentFolder ? parentFolder.name : null,
      details: { ...workshopForm },
      createdAt: new Date().toLocaleString()
    };

    setDeletedFolderNames(prev => prev.filter(n => n.toLowerCase() !== workshopName.toLowerCase() && n.toLowerCase() !== folder.id.toLowerCase()));
    setCustomFolders(prev => [...prev, folder]);
    setIsWorkshopModalOpen(false);
    const targetLoc = parentFolder ? `folder "${parentFolder.name}"` : 'Root Dashboard';
    if (showToast) showToast(`🛠️ Created workshop "${workshopName}" inside ${targetLoc}!`);
  };

  const handleCutFolders = (targetFolders) => {
    const items = Array.isArray(targetFolders) ? targetFolders : (targetFolders ? [targetFolders] : []);
    if (items.length === 0) return;
    setFolderClipboard({ folders: items, mode: 'cut' });
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
    if (showToast) showToast(`✂️ Cut ${items.length} folder(s). Go to destination and click Paste!`);
  };

  const handleCopyFolders = (targetFolders) => {
    const items = Array.isArray(targetFolders) ? targetFolders : (targetFolders ? [targetFolders] : []);
    if (items.length === 0) return;
    setFolderClipboard({ folders: items, mode: 'copy' });
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
    if (showToast) showToast(`📋 Copied ${items.length} folder(s). Go to destination and click Paste!`);
  };

  const handlePasteFolders = (destFolder = openedFolderPage) => {
    if (!folderClipboard.mode || folderClipboard.folders.length === 0) {
      if (showToast) showToast(`⚠️ Clipboard is empty. Cut or Copy a folder first!`);
      return;
    }

    const targetParentId = destFolder ? destFolder.id : null;
    const targetParentName = destFolder ? destFolder.name : null;
    const destName = destFolder ? destFolder.name : 'Root Dashboard';

    if (folderClipboard.mode === 'cut') {
      const cutIds = folderClipboard.folders.map(f => f.id);
      const cutNames = folderClipboard.folders.map(f => f.name.toLowerCase());

      // Update parentId and parentName for all cut folders
      setCustomFolders(prev => prev.map(f => {
        if (cutIds.includes(f.id) || cutNames.includes(f.name.toLowerCase())) {
          return {
            ...f,
            parentId: targetParentId,
            parentName: targetParentName
          };
        }
        return f;
      }));

      // Ensure cut folders are restored if in deleted set
      setDeletedFolderNames(prev => prev.filter(n => !cutNames.includes(n.toLowerCase())));

      setFolderClipboard({ folders: [], mode: null });
      setContextMenu({ visible: false, x: 0, y: 0, folder: null });
      if (showToast) showToast(`📥 Moved ${cutIds.length} folder(s) to ${destName}!`);
    } else if (folderClipboard.mode === 'copy') {
      const newFolderCopies = folderClipboard.folders.map((f, idx) => ({
        ...f,
        id: 'folder-' + Date.now() + '-' + idx,
        name: f.name + (f.parentId === targetParentId ? ' - Copy' : ''),
        parentId: targetParentId,
        parentName: targetParentName,
        createdAt: new Date().toLocaleString()
      }));

      setCustomFolders(prev => [...prev, ...newFolderCopies]);
      setContextMenu({ visible: false, x: 0, y: 0, folder: null });
      if (showToast) showToast(`📋 Copied ${newFolderCopies.length} folder(s) into ${destName}!`);
    }
  };

  // Keyboard Shortcuts for Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V)
  useEffect(() => {
    const handleClipboardKeyDown = (e) => {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'x') {
        if (selectedFolderIds.length > 0) {
          e.preventDefault();
          const targetFolders = allFoldersList.filter(f => selectedFolderIds.includes(f.id));
          handleCutFolders(targetFolders);
        } else if (contextMenu.folder) {
          e.preventDefault();
          handleCutFolders([contextMenu.folder]);
        }
      } else if (modifier && e.key.toLowerCase() === 'c') {
        if (selectedFolderIds.length > 0) {
          e.preventDefault();
          const targetFolders = allFoldersList.filter(f => selectedFolderIds.includes(f.id));
          handleCopyFolders(targetFolders);
        } else if (contextMenu.folder) {
          e.preventDefault();
          handleCopyFolders([contextMenu.folder]);
        }
      } else if (modifier && e.key.toLowerCase() === 'v') {
        if (folderClipboard.mode && folderClipboard.folders.length > 0) {
          e.preventDefault();
          const dest = contextMenu.folder || openedFolderPage;
          handlePasteFolders(dest);
        }
      }
    };

    window.addEventListener('keydown', handleClipboardKeyDown);
    return () => window.removeEventListener('keydown', handleClipboardKeyDown);
  }, [selectedFolderIds, allFoldersList, folderClipboard, contextMenu.folder, openedFolderPage]);

  // Right Click Context Menu close listener
  useEffect(() => {
    const handleCloseMenu = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, folder: null });
      }
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('scroll', handleCloseMenu);
    };
  }, [contextMenu.visible]);

  const handleFolderContextMenu = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      folder: folder
    });
  };

  const handleOpenRenameModal = (folder) => {
    setRenameModal({
      isOpen: true,
      folder: folder,
      newName: folder.name
    });
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
  };

  const handleConfirmRename = (e) => {
    e.preventDefault();
    if (!renameModal.folder || !renameModal.newName.trim()) return;

    const targetFolder = renameModal.folder;
    const updatedName = renameModal.newName.trim();

    setCustomFolders(prev => prev.map(f => f.id === targetFolder.id ? { ...f, name: updatedName } : f));
    setRenameModal({ isOpen: false, folder: null, newName: '' });
    if (showToast) showToast(`✏️ Folder renamed to "${updatedName}"!`);
  };

  const handleDeleteFolder = (folder) => {
    if (window.confirm(`Are you sure you want to delete folder "${folder.name}"?`)) {
      setCustomFolders(prev => prev.filter(f => f.id !== folder.id && f.name !== folder.name));
      setDeletedFolderNames(prev => Array.from(new Set([...prev, folder.name.toLowerCase(), folder.id.toLowerCase()])));
      setSelectedFolderIds(prev => prev.filter(id => id !== folder.id));
      setContextMenu({ visible: false, x: 0, y: 0, folder: null });
      if (showToast) showToast(`🗑️ Deleted folder "${folder.name}"`);
    }
  };

  // Bulk Delete Function for Keyboard Delete Key or Action Button
  const handleDeleteSelectedFolders = () => {
    if (selectedFolderIds.length === 0) return;

    const targetFolders = allFoldersList.filter(f => selectedFolderIds.includes(f.id));
    const targetNames = targetFolders.map(f => f.name);
    const targetKeys = targetFolders.flatMap(f => [f.id.toLowerCase(), f.name.toLowerCase()]);

    const confirmMsg = targetFolders.length === 1
      ? `Are you sure you want to delete folder "${targetNames[0]}"?`
      : `Are you sure you want to delete these ${targetFolders.length} selected folders?\n\n` + targetNames.slice(0, 5).map(n => `- ${n}`).join('\n') + (targetNames.length > 5 ? `\n...and ${targetNames.length - 5} more` : '');

    if (window.confirm(confirmMsg)) {
      setCustomFolders(prev => prev.filter(f => !selectedFolderIds.includes(f.id) && !targetNames.includes(f.name)));
      setDeletedFolderNames(prev => Array.from(new Set([...prev, ...targetKeys])));
      setSelectedFolderIds([]);
      setAnchorFolderIndex(null);
      setCurrentFolderIndex(null);
      setColumnFilters(prev => ({ ...prev, college: [], workshopName: [] }));
      setSearchQuery('');
      if (showToast) showToast(`🗑️ Deleted ${targetFolders.length} folder(s)`);
    }
  };

  // Persist Custom Folders
  useEffect(() => {
    try {
      localStorage.setItem('ranbidge_custom_folders', JSON.stringify(customFolders));
    } catch (e) {}
  }, [customFolders]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folderName = newFolderName.trim();
    const folder = {
      id: 'folder-' + Date.now(),
      name: folderName,
      parentId: openedFolderPage ? openedFolderPage.id : null,
      parentName: openedFolderPage ? openedFolderPage.name : null,
      createdAt: new Date().toLocaleString()
    };
    setDeletedFolderNames(prev => prev.filter(n => n.toLowerCase() !== folderName.toLowerCase() && n.toLowerCase() !== folder.id.toLowerCase()));
    setCustomFolders(prev => [...prev, folder]);
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
    const targetLoc = openedFolderPage ? `folder "${openedFolderPage.name}"` : 'Root Dashboard';
    if (showToast) showToast(`📁 Created folder "${folder.name}" inside ${targetLoc}!`);
  };

  // Filter records & certificates for Opened Dedicated Folder Page
  const openedFolderRecords = useMemo(() => {
    if (!openedFolderPage) return [];
    const key = openedFolderPage.name.toLowerCase().trim();
    return records.filter(r => 
      (r.college && r.college.toLowerCase().trim() === key) ||
      (r.workshopName && r.workshopName.toLowerCase().trim() === key) ||
      (r.department && r.department.toLowerCase().trim() === key) ||
      (r.fullName && r.fullName.toLowerCase().includes(key)) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(key))
    );
  }, [records, openedFolderPage]);

  const openedFolderCertificates = useMemo(() => {
    if (!openedFolderPage) return [];
    const key = openedFolderPage.name.toLowerCase().trim();
    const folderIdStr = String(openedFolderPage.id || '').toLowerCase().trim();
    return certificates.filter(c => 
      (c.folderId && String(c.folderId).toLowerCase().trim() === folderIdStr) ||
      (c.folderName && c.folderName.toLowerCase().trim() === key) ||
      (c.college && c.college.toLowerCase().trim() === key) ||
      (c.workshopName && c.workshopName.toLowerCase().trim() === key) ||
      (c.studentName && c.studentName.toLowerCase().includes(key)) ||
      (c.fileName && c.fileName.toLowerCase().includes(key)) ||
      (c.rollNumber && c.rollNumber.toLowerCase().includes(key))
    );
  }, [certificates, openedFolderPage]);

  // Sub-Folders located inside the currently opened folder
  const openedFolderSubFolders = useMemo(() => {
    if (!openedFolderPage) return [];
    const deletedSet = new Set(deletedFolderNames.map(n => n.toLowerCase()));
    const currentId = String(openedFolderPage.id || '').toLowerCase().trim();
    const currentName = String(openedFolderPage.name || '').toLowerCase().trim();

    return customFolders.filter(f => {
      const fId = String(f.id || '').toLowerCase().trim();
      const fName = String(f.name || '').toLowerCase().trim();
      const fParentId = String(f.parentId || '').toLowerCase().trim();
      const fParentName = String(f.parentName || '').toLowerCase().trim();

      if (deletedSet.has(fName) || deletedSet.has(fId)) return false;

      const isChild = (
        (fParentId && (fParentId === currentId || fParentId === `col-${currentName}` || fParentId === `ws-${currentName}`)) ||
        (fParentName && fParentName === currentName)
      );

      return isChild;
    });
  }, [openedFolderPage, customFolders, deletedFolderNames]);

  // Apply Filter to main table based on selected folder(s)
  const applyFolderFilterForSelection = (folders) => {
    if (!folders || folders.length === 0) {
      setColumnFilters(prev => ({ ...prev, college: [], workshopName: [] }));
      setSearchQuery('');
      return;
    }
    const colleges = folders.filter(f => f.type === 'college').map(f => f.name);
    const workshops = folders.filter(f => f.type === 'workshop').map(f => f.name);
    const customNames = folders.filter(f => f.type === 'custom').map(f => f.name);

    setColumnFilters(prev => ({
      ...prev,
      college: colleges,
      workshopName: workshops
    }));

    if (customNames.length > 0) {
      setSearchQuery(customNames.join(' '));
    } else {
      setSearchQuery('');
    }
  };

  // Folder Click Handler supporting Shift+Click range select
  const handleFolderClick = (e, folder, index) => {
    if (e.shiftKey && anchorFolderIndex !== null) {
      const start = Math.min(anchorFolderIndex, index);
      const end = Math.max(anchorFolderIndex, index);
      const range = allFoldersList.slice(start, end + 1);
      const ids = range.map(f => f.id);
      setSelectedFolderIds(ids);
      setCurrentFolderIndex(index);
      applyFolderFilterForSelection(range);
    } else if (e.ctrlKey || e.metaKey) {
      const exists = selectedFolderIds.includes(folder.id);
      const newIds = exists ? selectedFolderIds.filter(id => id !== folder.id) : [...selectedFolderIds, folder.id];
      setSelectedFolderIds(newIds);
      setAnchorFolderIndex(index);
      setCurrentFolderIndex(index);
      const selectedFolders = allFoldersList.filter(f => newIds.includes(f.id));
      applyFolderFilterForSelection(selectedFolders);
    } else {
      const isAlreadySingle = selectedFolderIds.length === 1 && selectedFolderIds[0] === folder.id;
      if (isAlreadySingle) {
        setSelectedFolderIds([]);
        setAnchorFolderIndex(null);
        setCurrentFolderIndex(null);
        setColumnFilters(prev => ({ ...prev, college: [], workshopName: [] }));
        setSearchQuery('');
      } else {
        setSelectedFolderIds([folder.id]);
        setAnchorFolderIndex(index);
        setCurrentFolderIndex(index);
        applyFolderFilterForSelection([folder]);
      }
    }
  };

  // Keyboard Shortcuts Listener for Shift + Right/Left Arrow Selection and Delete key Bulk Delete
  useEffect(() => {
    if (!isOpen || adminTab !== 'registrations') return;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (isInput || isAddFolderModalOpen || renameModal.isOpen) return;

      // 1. Delete or Backspace Key -> Delete selected folders
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFolderIds.length > 0) {
          e.preventDefault();
          handleDeleteSelectedFolders();
        }
        return;
      }

      // 2. Shift + Right / Left / Down / Up Arrow -> Multi-select folder range
      if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        if (allFoldersList.length === 0) return;
        e.preventDefault();

        const baseAnchor = anchorFolderIndex !== null ? anchorFolderIndex : 0;
        const currentIdx = currentFolderIndex !== null ? currentFolderIndex : baseAnchor;
        let nextIdx = currentIdx;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIdx = Math.min(allFoldersList.length - 1, currentIdx + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIdx = Math.max(0, currentIdx - 1);
        }

        const start = Math.min(baseAnchor, nextIdx);
        const end = Math.max(baseAnchor, nextIdx);
        const rangeFolders = allFoldersList.slice(start, end + 1);
        const rangeIds = rangeFolders.map(f => f.id);

        setAnchorFolderIndex(baseAnchor);
        setCurrentFolderIndex(nextIdx);
        setSelectedFolderIds(rangeIds);
        applyFolderFilterForSelection(rangeFolders);
        return;
      }

      // 3. ArrowRight / ArrowLeft Navigation without Shift
      if (!e.shiftKey && !e.ctrlKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        if (allFoldersList.length === 0) return;
        e.preventDefault();

        const currentIdx = currentFolderIndex !== null ? currentFolderIndex : 0;
        const nextIdx = e.key === 'ArrowRight' ? Math.min(allFoldersList.length - 1, currentIdx + 1) : Math.max(0, currentIdx - 1);
        const targetFolder = allFoldersList[nextIdx];
        if (targetFolder) {
          setAnchorFolderIndex(nextIdx);
          setCurrentFolderIndex(nextIdx);
          setSelectedFolderIds([targetFolder.id]);
          applyFolderFilterForSelection([targetFolder]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, adminTab, selectedFolderIds, anchorFolderIndex, currentFolderIndex, allFoldersList, isAddFolderModalOpen, renameModal.isOpen]);

  // Keyboard Escape key handler to close modals in priority order
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewingStudentDetail) {
          setViewingStudentDetail(null);
        } else if (selectedGeneratedCertRecord) {
          setSelectedGeneratedCertRecord(null);
        } else if (selectedPreviewCert) {
          setSelectedPreviewCert(null);
        } else if (openedFolderPage) {
          setOpenedFolderPage(null);
        } else if (isUsersDirectoryOpen) {
          setIsUsersDirectoryOpen(false);
        } else if (selectedCollegeName) {
          setSelectedCollegeName(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedCollegeName, selectedPreviewCert, selectedGeneratedCertRecord, viewingStudentDetail, isUsersDirectoryOpen, openedFolderPage, onClose]);

  // College breakdown analysis from both records and dumped certificates
  const collegeBreakdown = useMemo(() => {
    const map = {};

    const getOrCreateCollege = (nameStr) => {
      const canonical = nameStr && nameStr.trim() ? nameStr.trim() : 'Unspecified College';
      const key = canonical.toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: canonical,
          records: [],
          certificates: []
        };
      }
      return map[key];
    };

    // 1. Process Registrations
    records.forEach(rec => {
      const entry = getOrCreateCollege(rec.college);
      entry.records.push(rec);
    });

    // 2. Process Dumped Certificates
    certificates.forEach(cert => {
      let matchedCollege = cert.college ? cert.college.trim() : null;

      if (!matchedCollege && cert.rollNumber) {
        const found = records.find(r => r.rollNumber && r.rollNumber.trim().toUpperCase() === cert.rollNumber.trim().toUpperCase());
        if (found && found.college) {
          matchedCollege = found.college.trim();
        }
      }

      if (!matchedCollege && cert.studentName) {
        const found = records.find(r => r.fullName && r.fullName.trim().toLowerCase() === cert.studentName.trim().toLowerCase());
        if (found && found.college) {
          matchedCollege = found.college.trim();
        }
      }

      const entry = getOrCreateCollege(matchedCollege || 'Unspecified College');
      if (!entry.certificates.some(c => c.id === cert.id)) {
        entry.certificates.push(cert);
      }
    });

    return Object.values(map);
  }, [records, certificates]);

  const stats = useMemo(() => {
    const total = records.length;
    const validColleges = collegeBreakdown.filter(c => c.name !== 'Unspecified College' || c.records.length > 0 || c.certificates.length > 0);
    const collegesCount = validColleges.length;
    const certsCount = certificates.length;
    return { total, collegesCount, certsCount };
  }, [records, certificates, collegeBreakdown]);

  const uniqueOptions = useMemo(() => {
    const getUnique = (key) => {
      const counts = {};
      records.forEach(r => {
        const val = r[key] ? String(r[key]).trim() : '';
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      return Object.keys(counts).sort().map(val => ({
        value: val,
        count: counts[val]
      }));
    };

    return {
      college: getUnique('college'),
      department: getUnique('department'),
      workshopName: getUnique('workshopName'),
      passoutYear: getUnique('passoutYear'),
      workshopDate: getUnique('workshopDate')
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    let list = records.filter(r => {
      // 1. Global Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesGlobal = !q || (
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.college && r.college.toLowerCase().includes(q)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q)) ||
        (r.workshopName && r.workshopName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
      if (!matchesGlobal) return false;

      // 2. Text Column Filters
      if (columnFilters.id && !r.id?.toLowerCase().includes(columnFilters.id.toLowerCase())) return false;
      if (columnFilters.fullName && !r.fullName?.toLowerCase().includes(columnFilters.fullName.toLowerCase())) return false;
      if (columnFilters.rollNumber && !r.rollNumber?.toLowerCase().includes(columnFilters.rollNumber.toLowerCase())) return false;

      // 3. Multi-Select Array Column Filters
      if (columnFilters.college.length > 0 && !columnFilters.college.includes(r.college)) return false;
      if (columnFilters.passoutYear.length > 0 && !columnFilters.passoutYear.includes(String(r.passoutYear))) return false;
      if (columnFilters.department.length > 0 && !columnFilters.department.includes(r.department)) return false;
      if (columnFilters.workshopName.length > 0 && !columnFilters.workshopName.includes(r.workshopName)) return false;
      if (columnFilters.workshopDate.length > 0 && !columnFilters.workshopDate.includes(r.workshopDate)) return false;

      return true;
    });

    // 4. Sorting
    if (sortConfig.col && sortConfig.dir) {
      list = [...list].sort((a, b) => {
        const valA = (a[sortConfig.col] || '').toString().toLowerCase();
        const valB = (b[sortConfig.col] || '').toString().toLowerCase();
        if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [records, searchQuery, columnFilters, sortConfig]);

  const activeColumnFiltersCount = useMemo(() => {
    let count = 0;
    if (columnFilters.id) count++;
    if (columnFilters.fullName) count++;
    if (columnFilters.rollNumber) count++;
    if (columnFilters.college.length > 0) count++;
    if (columnFilters.passoutYear.length > 0) count++;
    if (columnFilters.department.length > 0) count++;
    if (columnFilters.workshopName.length > 0) count++;
    if (columnFilters.workshopDate.length > 0) count++;
    return count;
  }, [columnFilters]);

  const handleClearColumnFilters = () => {
    setColumnFilters({
      id: '',
      fullName: '',
      rollNumber: '',
      college: [],
      passoutYear: [],
      department: [],
      workshopName: [],
      workshopDate: []
    });
    setSortConfig({ col: null, dir: null });
    setActivePopover(null);
    if (showToast) showToast('Column filters reset');
  };

  useEffect(() => {
    if (!activePopover) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.th-popover-container')) {
        setActivePopover(null);
        setPopoverSearch('');
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activePopover]);

  // Filtered Users Directory List
  const filteredUsersDirectory = useMemo(() => {
    return records.filter(user => {
      const q = userDirSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (user.fullName && user.fullName.toLowerCase().includes(q)) ||
        (user.rollNumber && user.rollNumber.toLowerCase().includes(q)) ||
        (user.college && user.college.toLowerCase().includes(q)) ||
        (user.department && user.department.toLowerCase().includes(q)) ||
        (user.workshopName && user.workshopName.toLowerCase().includes(q)) ||
        (user.id && user.id.toLowerCase().includes(q))
      );

      const matchesCollege = !selectedCollegeFilter || user.college === selectedCollegeFilter;
      const matchesWorkshop = !selectedWorkshopFilter || user.workshopName === selectedWorkshopFilter;

      return matchesSearch && matchesCollege && matchesWorkshop;
    });
  }, [records, userDirSearchQuery, selectedCollegeFilter, selectedWorkshopFilter]);

  // Unique College and Workshop lists for dropdown filters
  const uniqueColleges = useMemo(() => {
    return Array.from(new Set(records.map(r => r.college).filter(Boolean))).sort();
  }, [records]);

  const uniqueWorkshops = useMemo(() => {
    return Array.from(new Set(records.map(r => r.workshopName).filter(Boolean))).sort();
  }, [records]);

  // Filtered list of colleges for the Colleges Grid Modal
  const filteredColleges = useMemo(() => {
    const q = collegeSearchQuery.toLowerCase().trim();
    if (!q) return collegeBreakdown;
    return collegeBreakdown.filter(col => 
      col.name.toLowerCase().includes(q) ||
      col.records.some(r => (r.fullName && r.fullName.toLowerCase().includes(q)) || (r.rollNumber && r.rollNumber.toLowerCase().includes(q))) ||
      col.certificates.some(c => (c.fileName && c.fileName.toLowerCase().includes(q)) || (c.rollNumber && c.rollNumber.toLowerCase().includes(q)) || (c.studentName && c.studentName.toLowerCase().includes(q)))
    );
  }, [collegeBreakdown, collegeSearchQuery]);

  const [selectedActivityFilter, setSelectedActivityFilter] = useState('all');

  const activeCollege = useMemo(() => {
    if (!selectedCollegeName) return null;
    return collegeBreakdown.find(c => c.name.toLowerCase() === selectedCollegeName.toLowerCase());
  }, [collegeBreakdown, selectedCollegeName]);

  const getActivityInfo = (activityName) => {
    const name = (activityName || 'General Workshop').trim();
    const lower = name.toLowerCase();
    if (lower.includes('hackathon')) {
      return { name, type: 'Hackathon', badgeColor: '#7c3aed', badgeBg: '#f3e8ff', icon: '🚀' };
    } else if (lower.includes('bootcamp')) {
      return { name, type: 'Bootcamp', badgeColor: '#0284c7', badgeBg: '#e0f2fe', icon: '💻' };
    } else if (lower.includes('seminar') || lower.includes('symposium') || lower.includes('webinar')) {
      return { name, type: 'Seminar', badgeColor: '#d97706', badgeBg: '#fef3c7', icon: '🎙️' };
    } else if (lower.includes('internship') || lower.includes('training')) {
      return { name, type: 'Training', badgeColor: '#059669', badgeBg: '#d1fae5', icon: '💼' };
    } else if (lower.includes('project') || lower.includes('challenge')) {
      return { name, type: 'Challenge', badgeColor: '#dc2626', badgeBg: '#fee2e2', icon: '⚡' };
    } else {
      return { name, type: 'Workshop', badgeColor: '#2563eb', badgeBg: '#dbeafe', icon: '🛠️' };
    }
  };

  const collegeActivities = useMemo(() => {
    if (!activeCollege) return [];
    const map = {};

    activeCollege.records.forEach(r => {
      const actName = (r.workshopName && r.workshopName.trim()) ? r.workshopName.trim() : 'General Workshop';
      const key = actName.toLowerCase();
      if (!map[key]) {
        const info = getActivityInfo(actName);
        map[key] = {
          name: actName,
          type: info.type,
          icon: info.icon,
          badgeColor: info.badgeColor,
          badgeBg: info.badgeBg,
          recordsCount: 0,
          certsCount: 0,
          dates: new Set(),
          departments: new Set()
        };
      }
      map[key].recordsCount += 1;
      if (r.workshopDate) map[key].dates.add(r.workshopDate);
      if (r.department) map[key].departments.add(r.department);
    });

    activeCollege.certificates.forEach(c => {
      const actName = (c.workshopName || c.title || 'Certificate Program').trim();
      const key = actName.toLowerCase();
      if (!map[key]) {
        const info = getActivityInfo(actName);
        map[key] = {
          name: actName,
          type: info.type,
          icon: info.icon,
          badgeColor: info.badgeColor,
          badgeBg: info.badgeBg,
          recordsCount: 0,
          certsCount: 0,
          dates: new Set(),
          departments: new Set()
        };
      }
      map[key].certsCount += 1;
    });

    return Object.values(map);
  }, [activeCollege]);

  const filteredCertificatesForCollege = useMemo(() => {
    if (!activeCollege) return [];
    return activeCollege.certificates.filter(cert => {
      const actName = (cert.workshopName || cert.title || 'Certificate Program').trim();
      const matchesAct = selectedActivityFilter === 'all' || actName.toLowerCase() === selectedActivityFilter.toLowerCase();
      const q = collegeSearchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        (cert.fileName && cert.fileName.toLowerCase().includes(q)) ||
        (cert.studentName && cert.studentName.toLowerCase().includes(q)) ||
        (cert.rollNumber && cert.rollNumber.toLowerCase().includes(q))
      );
      return matchesAct && matchesQuery;
    });
  }, [activeCollege, selectedActivityFilter, collegeSearchQuery]);

  const filteredRecordsForCollege = useMemo(() => {
    if (!activeCollege) return [];
    return activeCollege.records.filter(rec => {
      const actName = (rec.workshopName && rec.workshopName.trim()) ? rec.workshopName.trim() : 'General Workshop';
      const matchesAct = selectedActivityFilter === 'all' || actName.toLowerCase() === selectedActivityFilter.toLowerCase();
      const q = collegeSearchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        (rec.fullName && rec.fullName.toLowerCase().includes(q)) ||
        (rec.rollNumber && rec.rollNumber.toLowerCase().includes(q)) ||
        (rec.department && rec.department.toLowerCase().includes(q))
      );
      return matchesAct && matchesQuery;
    });
  }, [activeCollege, selectedActivityFilter, collegeSearchQuery]);

  const handleDownloadCert = (cert) => {
    const link = document.createElement('a');
    link.href = cert.fileData;
    link.download = cert.fileName || `${cert.rollNumber || 'Certificate'}.${cert.fileType || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      showToast('⚠️ No records to export');
      return;
    }

    const headers = ['ID', 'Full Name', 'College', 'Roll Number', 'Passout Year', 'Department', 'Workshop Name', 'Workshop Date', 'Submitted At'];
    const rows = records.map(r => [
      r.id,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      `"${(r.college || '').replace(/"/g, '""')}"`,
      `"${(r.rollNumber || '').replace(/"/g, '""')}"`,
      r.passoutYear,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.workshopName || '').replace(/"/g, '""')}"`,
      r.workshopDate,
      r.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RANBIDGE_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 CSV file exported successfully!');
  };

  const renderTextPopover = (colKey, colLabel) => {
    if (activePopover !== colKey) return null;
    return (
      <div className="column-filter-popover" onClick={(e) => e.stopPropagation()}>
        <div className="popover-header">
          <span>Filter by {colLabel}</span>
          <button className="btn-close-sm" onClick={() => setActivePopover(null)}>&times;</button>
        </div>
        <div className="popover-sort-row">
          <button
            type="button"
            className={`popover-sort-btn ${sortConfig.col === colKey && sortConfig.dir === 'asc' ? 'active' : ''}`}
            onClick={() => setSortConfig({ col: colKey, dir: 'asc' })}
          >
            <ArrowUp size={12} /> Asc (A-Z)
          </button>
          <button
            type="button"
            className={`popover-sort-btn ${sortConfig.col === colKey && sortConfig.dir === 'desc' ? 'active' : ''}`}
            onClick={() => setSortConfig({ col: colKey, dir: 'desc' })}
          >
            <ArrowDown size={12} /> Desc (Z-A)
          </button>
        </div>
        <input
          type="text"
          className="form-input"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', marginBottom: '0.65rem' }}
          placeholder={`Search ${colLabel}...`}
          value={columnFilters[colKey] || ''}
          onChange={(e) => setColumnFilters(prev => ({ ...prev, [colKey]: e.target.value }))}
        />
        <div className="popover-footer">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => {
              setColumnFilters(prev => ({ ...prev, [colKey]: '' }));
              if (sortConfig.col === colKey) setSortConfig({ col: null, dir: null });
            }}
          >
            Reset
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={() => setActivePopover(null)}>
            Apply
          </button>
        </div>
      </div>
    );
  };

  const renderCategoryPopover = (colKey, colLabel, optionsList) => {
    if (activePopover !== colKey) return null;

    const currentSelected = columnFilters[colKey] || [];
    const filteredOpts = optionsList.filter(o => !popoverSearch || o.value.toLowerCase().includes(popoverSearch.toLowerCase()));

    return (
      <div className="column-filter-popover" onClick={(e) => e.stopPropagation()}>
        <div className="popover-header">
          <span>Filter by {colLabel} ({optionsList.length})</span>
          <button className="btn-close-sm" onClick={() => setActivePopover(null)}>&times;</button>
        </div>

        <div className="popover-sort-row">
          <button
            type="button"
            className={`popover-sort-btn ${sortConfig.col === colKey && sortConfig.dir === 'asc' ? 'active' : ''}`}
            onClick={() => setSortConfig({ col: colKey, dir: 'asc' })}
          >
            <ArrowUp size={12} /> Sort Asc
          </button>
          <button
            type="button"
            className={`popover-sort-btn ${sortConfig.col === colKey && sortConfig.dir === 'desc' ? 'active' : ''}`}
            onClick={() => setSortConfig({ col: colKey, dir: 'desc' })}
          >
            <ArrowDown size={12} /> Sort Desc
          </button>
        </div>

        <input
          type="text"
          className="form-input"
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', marginBottom: '0.4rem' }}
          placeholder={`Search ${colLabel} options...`}
          value={popoverSearch}
          onChange={(e) => setPopoverSearch(e.target.value)}
        />

        <div className="popover-quick-actions">
          <button
            type="button"
            onClick={() => setColumnFilters(prev => ({ ...prev, [colKey]: optionsList.map(o => o.value) }))}
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setColumnFilters(prev => ({ ...prev, [colKey]: [] }))}
          >
            Deselect All
          </button>
        </div>

        <div className="popover-options-list">
          {filteredOpts.length > 0 ? (
            filteredOpts.map(opt => {
              const checked = currentSelected.includes(opt.value);
              return (
                <label key={opt.value} className="popover-option-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const val = opt.value;
                      setColumnFilters(prev => ({
                        ...prev,
                        [colKey]: e.target.checked
                          ? [...(prev[colKey] || []), val]
                          : (prev[colKey] || []).filter(v => v !== val)
                      }));
                    }}
                  />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.value}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({opt.count})</span>
                </label>
              );
            })
          ) : (
            <div style={{ padding: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>No options found</div>
          )}
        </div>

        <div className="popover-footer">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => {
              setColumnFilters(prev => ({ ...prev, [colKey]: [] }));
              if (sortConfig.col === colKey) setSortConfig({ col: null, dir: null });
            }}
          >
            Reset
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={() => setActivePopover(null)}>
            Apply
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1200, padding: 0 }} onClick={onClose}>
        <div className="admin-modal-container" style={{ maxWidth: '100vw', width: '100vw', height: '100vh', maxHeight: '100vh', borderRadius: 0, padding: '1.75rem 2rem', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
          
          {/* Admin Modal Header */}
          <div className="admin-header" style={{ position: 'relative' }}>
            <div className="admin-header-title">
              <div className="admin-badge">
                <Shield size={14} /> Secret Admin Portal
              </div>
              <h2>RANBIDGE Verification Dashboard</h2>
              <p>Manage registrations, inspect user profiles, and dump certificate files for user downloads.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              {/* Settings Icon Button (Left side of Close icon) */}
              <button
                type="button"
                className="btn-icon-close"
                onClick={() => setIsSettingsPopoverOpen(prev => !prev)}
                title="Portal Settings & Restore Deleted Folders"
                style={{
                  background: isSettingsPopoverOpen ? 'var(--primary-light)' : 'transparent',
                  color: isSettingsPopoverOpen ? 'var(--primary)' : 'inherit'
                }}
              >
                <Settings size={20} />
              </button>

              {/* Close Icon Button */}
              <button className="btn-icon-close" onClick={onClose} title="Close Admin Portal (Esc)">
                <X size={20} />
              </button>

              {/* Settings Popover Dropdown */}
              {isSettingsPopoverOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.6rem)',
                  right: '2.5rem',
                  background: '#ffffff',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '0.6rem',
                  zIndex: 1400,
                  minWidth: '230px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', padding: '0.35rem 0.6rem 0.45rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Dashboard Settings
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeletedFolderNames([]);
                      try {
                        localStorage.removeItem('ranbidge_deleted_folders');
                      } catch (e) {}
                      setIsSettingsPopoverOpen(false);
                      if (showToast) showToast('↺ Restored all deleted folders to Admin Drive!');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      width: '100%',
                      padding: '0.55rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <RotateCcw size={16} color="var(--primary)" />
                    <span>Restore Deleted Folders</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="admin-stats-grid">
            <div 
              className="admin-stat-card clickable" 
              onClick={() => setIsUsersDirectoryOpen(true)}
              title="Click to check all user registration profiles stored in Firebase"
            >
              <div className="stat-icon primary">
                <Users />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{stats.total}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 800 }}>
                    Check Users &rarr;
                  </span>
                </div>
                <div className="stat-label">Total Registered Users</div>
              </div>
            </div>

            {/* Clickable Colleges Count Stat Card Container */}
            <div 
              className="admin-stat-card clickable" 
              onClick={() => setIsCollegesDirectoryModalOpen(true)}
              title="Click to view all added colleges"
            >
              <div className="stat-icon success">
                <Building />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{stats.collegesCount}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 800 }}>
                    View Added Colleges &rarr;
                  </span>
                </div>
                <div className="stat-label">Colleges Represented</div>
              </div>
            </div>

            <div 
              className="admin-stat-card clickable"
              onClick={() => setAdminTab('master-dump')}
              title="Click to view & dump master roll numbers and names"
            >
              <div className="stat-icon primary" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <FileSpreadsheet />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{masterDump.length}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 800 }}>
                    Dump Data &rarr;
                  </span>
                </div>
                <div className="stat-label">Dumped Master Roll Data</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon accent">
                <Award />
              </div>
              <div>
                <div className="stat-value">{stats.certsCount}</div>
                <div className="stat-label">Dumped Certificates</div>
              </div>
            </div>
          </div>

          {/* Admin Section Tabs */}
          <div className="nav-tabs" style={{ marginBottom: '1.25rem', width: 'fit-content' }}>
            <button
              className={`nav-tab ${adminTab === 'registrations' ? 'active' : ''}`}
              onClick={() => setAdminTab('registrations')}
            >
              <Users size={16} />
              <span>Registration Records ({records.length})</span>
            </button>
            <button
              className={`nav-tab ${adminTab === 'master-dump' ? 'active' : ''}`}
              onClick={() => setAdminTab('master-dump')}
            >
              <FileSpreadsheet size={16} />
              <span>Dump Roll Numbers & Names ({masterDump.length})</span>
            </button>
            <button
              className={`nav-tab ${adminTab === 'certificates' ? 'active' : ''}`}
              onClick={() => setAdminTab('certificates')}
            >
              <FileUp size={16} />
              <span>Dump Certificates ({certificates.length})</span>
            </button>
          </div>

          {adminTab === 'registrations' ? (
            <>
              {/* File Explorer Dashboard Folders Drive */}
              <div className="dashboard-folders-section">
                <div className="dashboard-folders-header">
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
                      <Folder color="#eab308" size={18} /> Dashboard Folders ({allFoldersList.length})
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      Click a folder to inspect and filter records for that college or project directory.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedFolderIds.length > 0 && (
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedFolderIds([]);
                          setAnchorFolderIndex(null);
                          setCurrentFolderIndex(null);
                          setColumnFilters(prev => ({ ...prev, college: [], workshopName: [] }));
                          setSearchQuery('');
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <RotateCcw size={12} /> Clear Selection ({selectedFolderIds.length})
                      </button>
                    )}
                    {selectedFolderIds.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            const targetFolders = allFoldersList.filter(f => selectedFolderIds.includes(f.id));
                            handleCutFolders(targetFolders);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          title="Cut selected folders (Ctrl+X)"
                        >
                          <Scissors size={13} color="#d97706" /> Cut ({selectedFolderIds.length})
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            const targetFolders = allFoldersList.filter(f => selectedFolderIds.includes(f.id));
                            handleCopyFolders(targetFolders);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          title="Copy selected folders (Ctrl+C)"
                        >
                          <Copy size={13} color="#0284c7" /> Copy ({selectedFolderIds.length})
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={handleDeleteSelectedFolders}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                          title="Delete selected folders (Press Delete key on keyboard)"
                        >
                          <Trash2 size={13} /> Delete Selected ({selectedFolderIds.length})
                        </button>
                      </>
                    )}
                    {folderClipboard.mode && folderClipboard.folders.length > 0 && (
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => handlePasteFolders(null)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', background: '#16a34a', borderColor: '#16a34a' }}
                        title="Paste into Root Dashboard (Ctrl+V)"
                      >
                        <Clipboard size={13} /> Paste {folderClipboard.mode === 'cut' ? 'Moved' : 'Copied'} ({folderClipboard.folders.length})
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => setIsAddFolderModalOpen(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.45rem 0.75rem' }}
                      title="Create New Folder"
                    >
                      <FolderPlus size={16} />
                    </button>
                  </div>
                </div>

                <div className="folders-grid">
                  {allFoldersList.map((folder, index) => {
                    const isSelected = selectedFolderIds.includes(folder.id);
                    const isCut = folderClipboard.mode === 'cut' && folderClipboard.folders.some(f => f.id === folder.id || f.name.toLowerCase() === folder.name.toLowerCase());
                    return (
                      <div
                        key={folder.id}
                        className={`folder-grid-item ${isSelected ? 'active' : ''}`}
                        style={isCut ? { opacity: 0.5, borderStyle: 'dashed', borderColor: '#d97706' } : {}}
                        onClick={(e) => handleFolderClick(e, folder, index)}
                        onDoubleClick={() => setOpenedFolderPage(folder)}
                        onContextMenu={(e) => {
                          if (!selectedFolderIds.includes(folder.id)) {
                            setSelectedFolderIds([folder.id]);
                            setAnchorFolderIndex(index);
                            setCurrentFolderIndex(index);
                            applyFolderFilterForSelection([folder]);
                          }
                          handleFolderContextMenu(e, folder);
                        }}
                        title={`Folder: ${folder.name} (Single-click to select, Double-click to open)`}
                      >
                        <span className="folder-icon-img">📁</span>
                        <span className="folder-item-name">{folder.name}</span>
                        {folder.count > 0 && (
                          <span className="folder-item-count">{folder.count}</span>
                        )}
                        <button
                          type="button"
                          className="folder-options-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedFolderIds.includes(folder.id)) {
                              setSelectedFolderIds([folder.id]);
                              setAnchorFolderIndex(index);
                              setCurrentFolderIndex(index);
                              applyFolderFilterForSelection([folder]);
                            }
                            handleFolderContextMenu(e, folder);
                          }}
                          title="Folder options (Rename, Delete, Open)"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Toolbar */}
              <div className="admin-toolbar">
                <div className="admin-search-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by name, college, roll number, department, workshop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="admin-actions">
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={() => setIsFormSettingsModalOpen(true)}
                    title="Manage dropdown options for College Name, Workshop Title, and Department"
                    style={{ background: '#7c3aed', borderColor: '#6d28d9', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Settings size={15} /> Form Dropdowns
                  </button>
                  <button 
                    className="btn-primary btn-sm" 
                    onClick={() => setIsUsersDirectoryOpen(true)}
                    title="Check all registered users data stored in Firebase"
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <UserCheck size={15} /> Check Users Data ({records.length})
                  </button>
                  <button className="btn-primary btn-sm" onClick={handleExportCsv} title="Download CSV report">
                    <FileSpreadsheet size={15} /> Export CSV
                  </button>
                  <button className="btn-danger btn-sm" onClick={onClearAllRecords} title="Clear all registrations">
                    <Trash2 size={15} /> Clear All
                  </button>
                </div>
              </div>

              {/* Active Column Filters Bar */}
              {activeColumnFiltersCount > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.9rem'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Filter size={14} /> Active Column Filters ({activeColumnFiltersCount}):
                  </span>

                  {columnFilters.id && (
                    <span className="filter-tag">
                      ID: "{columnFilters.id}"
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, id: '' }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.fullName && (
                    <span className="filter-tag">
                      Name: "{columnFilters.fullName}"
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, fullName: '' }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.rollNumber && (
                    <span className="filter-tag">
                      Roll: "{columnFilters.rollNumber}"
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, rollNumber: '' }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.college.length > 0 && (
                    <span className="filter-tag">
                      College ({columnFilters.college.length})
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, college: [] }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.department.length > 0 && (
                    <span className="filter-tag">
                      Dept ({columnFilters.department.length})
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, department: [] }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.workshopName.length > 0 && (
                    <span className="filter-tag">
                      Workshop ({columnFilters.workshopName.length})
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, workshopName: [] }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.passoutYear.length > 0 && (
                    <span className="filter-tag">
                      Passout ({columnFilters.passoutYear.length})
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, passoutYear: [] }))}>&times;</button>
                    </span>
                  )}

                  {columnFilters.workshopDate.length > 0 && (
                    <span className="filter-tag">
                      Date ({columnFilters.workshopDate.length})
                      <button onClick={() => setColumnFilters(prev => ({ ...prev, workshopDate: [] }))}>&times;</button>
                    </span>
                  )}

                  <button
                    className="btn-secondary btn-sm"
                    onClick={handleClearColumnFilters}
                    style={{ marginLeft: 'auto', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    <RotateCcw size={12} /> Reset All Filters
                  </button>
                </div>
              )}

              {/* Bulk Selection Action Toolbar */}
              {selectedStudentIds.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}>
                      {selectedStudentIds.length} Selected
                    </span>
                    <span style={{ fontSize: '0.88rem', opacity: 0.9 }}>
                      Students selected for batch download & portal release
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    {/* Accept All Selected Icon Button (Green) */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleBulkApproveAndSend}
                      style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#16a34a', borderColor: '#15803d', borderRadius: 'var(--radius-md)' }}
                      title={`Accept All Selected (${selectedStudentIds.length}) & Send to User Portal`}
                    >
                      <UserCheck size={18} />
                    </button>

                    {/* Reject All Selected Icon Button (Red) */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleBulkReject}
                      style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#dc2626', borderColor: '#b91c1c', borderRadius: 'var(--radius-md)' }}
                      title={`Reject All Selected (${selectedStudentIds.length}) Students`}
                    >
                      <X size={18} />
                    </button>

                    {/* Download Selected Certificates Icon Button (Blue) */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleBulkDownloadCertificates}
                      style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', borderColor: '#2563eb', borderRadius: 'var(--radius-md)' }}
                      title={`Download Certificates (${selectedStudentIds.length})`}
                    >
                      <Download size={18} />
                    </button>

                    {/* Deselect All Icon Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      style={{
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                      title="Deselect All"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Data Table */}
              <div className="admin-table-wrapper">
                {filteredRecords.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            title="Select All Students"
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            checked={filteredRecords.length > 0 && filteredRecords.every(r => selectedStudentIds.includes(r.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const allIds = Array.from(new Set([...selectedStudentIds, ...filteredRecords.map(r => r.id)]));
                                setSelectedStudentIds(allIds);
                              } else {
                                const currentFilteredIds = new Set(filteredRecords.map(r => r.id));
                                setSelectedStudentIds(selectedStudentIds.filter(id => !currentFilteredIds.has(id)));
                              }
                            }}
                          />
                        </th>
                        <th>#</th>

                        {/* ID Column */}
                        <th className={`th-popover-container ${columnFilters.id || sortConfig.col === 'id' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'id' ? null : 'id'); setPopoverSearch(''); }}>
                            <span>ID</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.id && <span className="filter-dot" />}
                          </div>
                          {renderTextPopover('id', 'ID')}
                        </th>

                        {/* Participant Name Column */}
                        <th className={`th-popover-container ${columnFilters.fullName || sortConfig.col === 'fullName' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'fullName' ? null : 'fullName'); setPopoverSearch(''); }}>
                            <span>Participant Name</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.fullName && <span className="filter-dot" />}
                          </div>
                          {renderTextPopover('fullName', 'Participant Name')}
                        </th>

                        {/* College Column */}
                        <th className={`th-popover-container ${columnFilters.college.length > 0 || sortConfig.col === 'college' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'college' ? null : 'college'); setPopoverSearch(''); }}>
                            <span>College</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.college.length > 0 && <span className="filter-dot" />}
                          </div>
                          {renderCategoryPopover('college', 'College', uniqueOptions.college)}
                        </th>

                        {/* Roll Number Column */}
                        <th className={`th-popover-container ${columnFilters.rollNumber || sortConfig.col === 'rollNumber' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'rollNumber' ? null : 'rollNumber'); setPopoverSearch(''); }}>
                            <span>Roll Number</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.rollNumber && <span className="filter-dot" />}
                          </div>
                          {renderTextPopover('rollNumber', 'Roll Number')}
                        </th>

                        {/* Passout Column */}
                        <th className={`th-popover-container ${columnFilters.passoutYear.length > 0 || sortConfig.col === 'passoutYear' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'passoutYear' ? null : 'passoutYear'); setPopoverSearch(''); }}>
                            <span>Passout</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.passoutYear.length > 0 && <span className="filter-dot" />}
                          </div>
                          {renderCategoryPopover('passoutYear', 'Passout Year', uniqueOptions.passoutYear)}
                        </th>

                        {/* Department Column */}
                        <th className={`th-popover-container ${columnFilters.department.length > 0 || sortConfig.col === 'department' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'department' ? null : 'department'); setPopoverSearch(''); }}>
                            <span>Department</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.department.length > 0 && <span className="filter-dot" />}
                          </div>
                          {renderCategoryPopover('department', 'Department', uniqueOptions.department)}
                        </th>

                        {/* Workshop Column */}
                        <th className={`th-popover-container ${columnFilters.workshopName.length > 0 || sortConfig.col === 'workshopName' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'workshopName' ? null : 'workshopName'); setPopoverSearch(''); }}>
                            <span>Workshop</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.workshopName.length > 0 && <span className="filter-dot" />}
                          </div>
                          {renderCategoryPopover('workshopName', 'Workshop', uniqueOptions.workshopName)}
                        </th>

                        {/* Date Column */}
                        <th className={`th-popover-container ${columnFilters.workshopDate.length > 0 || sortConfig.col === 'workshopDate' ? 'active-filter-th' : ''}`}>
                          <div className="th-content" onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'workshopDate' ? null : 'workshopDate'); setPopoverSearch(''); }}>
                            <span>Date</span>
                            <ChevronDown size={14} className="th-arrow-icon" />
                            {columnFilters.workshopDate.length > 0 && <span className="filter-dot" />}
                          </div>
                          {renderCategoryPopover('workshopDate', 'Workshop Date', uniqueOptions.workshopDate)}
                        </th>

                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((rec, index) => {
                        const isVerified = rec.verificationStatus === 'verified';
                        return (
                          <tr 
                            key={rec.id || index}
                            onClick={() => setViewingStudentDetail(rec)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view full student registration credentials & certificate"
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                checked={selectedStudentIds.includes(rec.id)}
                                onChange={() => {
                                  if (selectedStudentIds.includes(rec.id)) {
                                    setSelectedStudentIds(selectedStudentIds.filter(id => id !== rec.id));
                                  } else {
                                    setSelectedStudentIds([...selectedStudentIds, rec.id]);
                                  }
                                }}
                              />
                            </td>
                            <td><strong>{index + 1}</strong></td>
                            <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{rec.id}</code></td>
                            <td><strong>{rec.fullName}</strong></td>
                            <td>{rec.college}</td>
                            <td><code>{rec.rollNumber}</code></td>
                            <td>{rec.passoutYear}</td>
                            <td>{rec.department}</td>
                            <td>
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                {rec.workshopName}
                              </span>
                            </td>
                            <td>{rec.workshopDate || 'N/A'}</td>
                            <td>
                              {isVerified ? (
                                <span
                                  title="Verified & Accepted"
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '0.35rem',
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #86efac'
                                  }}
                                >
                                  <CheckCircle2 size={16} />
                                </span>
                              ) : (
                                <span
                                  title="Pending Verification"
                                  style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    padding: '0.35rem',
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #fde68a'
                                  }}
                                >
                                  <Clock size={16} />
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-primary btn-sm"
                                  onClick={() => onVerifyRecord && onVerifyRecord(rec.id)}
                                  title={isVerified ? "Already Accepted & Verified" : "Accept Registration & Generate Certificate"}
                                  style={{
                                    padding: '0.45rem 0.6rem',
                                    borderRadius: '6px',
                                    background: isVerified ? '#15803d' : '#16a34a',
                                    borderColor: '#15803d',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <UserCheck size={16} color="#ffffff" />
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-del"
                                  onClick={() => onDeleteRecord(rec.id)}
                                  title="Cancel / Delete Record"
                                  style={{
                                    padding: '0.45rem 0.6rem',
                                    borderRadius: '6px',
                                    background: '#ef4444',
                                    borderColor: '#dc2626',
                                    color: '#ffffff',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={16} color="#ffffff" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty-state">
                    <FolderOpen size={48} />
                    <h3>No Registration Records Found</h3>
                    <p>Submit a registration form to populate the Admin Portal.</p>
                  </div>
                )}
              </div>
            </>
          ) : adminTab === 'master-dump' ? (
            <MasterRollDump
              masterDump={masterDump}
              records={records}
              onSaveMasterDump={onSaveMasterDump}
              onDeleteMasterEntry={onDeleteMasterEntry}
              onClearAllMasterDump={onClearAllMasterDump}
              onLoadSampleMasterData={onLoadSampleMasterData}
              showToast={showToast}
            />
          ) : (
            <CertificateDumpUpload
              certificates={certificates}
              onSaveCertificates={onSaveCertificates}
              onDeleteCertificate={onDeleteCertificate}
              showToast={showToast}
            />
          )}

        </div>
      </div>

      {/* CHECK USERS DATA DIRECTORY MODAL */}
      {isUsersDirectoryOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1150 }} onClick={() => setIsUsersDirectoryOpen(false)}>
          <div 
            className="admin-modal-container" 
            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-header">
              <div className="admin-header-title">
                <div className="admin-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  <UserCheck size={14} /> Firebase Live Registered Users Database
                </div>
                <h2>
                  Registered Users Directory ({filteredUsersDirectory.length} Students)
                </h2>
                <p>
                  Inspect student registration profiles, verify roll numbers, and view generated certificates stored in Firebase.
                </p>
              </div>
              <button 
                className="btn-icon-close" 
                onClick={() => setIsUsersDirectoryOpen(false)} 
                title="Close Users Directory (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar Filters */}
            <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div className="admin-search-wrapper" style={{ minWidth: '280px', flex: 1 }}>
                <Search className="search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search student name, roll number, college, department, workshop..."
                  value={userDirSearchQuery}
                  onChange={(e) => setUserDirSearchQuery(e.target.value)}
                />
              </div>

              {/* College Filter Dropdown */}
              <select
                className="admin-search-input"
                style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={selectedCollegeFilter}
                onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              >
                <option value="">All Colleges ({uniqueColleges.length})</option>
                {uniqueColleges.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>

              {/* Workshop Filter Dropdown */}
              <select
                className="admin-search-input"
                style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={selectedWorkshopFilter}
                onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
              >
                <option value="">All Workshops ({uniqueWorkshops.length})</option>
                {uniqueWorkshops.map((w, i) => (
                  <option key={i} value={w}>{w}</option>
                ))}
              </select>

              {(selectedCollegeFilter || selectedWorkshopFilter || userDirSearchQuery) && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setUserDirSearchQuery('');
                    setSelectedCollegeFilter('');
                    setSelectedWorkshopFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* USERS DIRECTORY GRID CARDS VIEW */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredUsersDirectory.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                  gap: '1.25rem',
                  paddingRight: '4px'
                }}>
                  {filteredUsersDirectory.map((user, idx) => (
                    <div
                      key={user.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition)'
                      }}
                      className="college-card"
                    >
                      <div>
                        {/* Header Profile Ribbon */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem'
                            }}>
                              <User size={22} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.2' }}>
                                {user.fullName}
                              </h3>
                              <code style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                                {user.id}
                              </code>
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '50px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        </div>

                        {/* Details List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.85rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Roll Number: </span>
                            <strong style={{ color: 'var(--primary)' }}>{user.rollNumber}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>College: </span>
                            <strong>{user.college}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Department: </span>
                            <span>{user.department} ({user.passoutYear})</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Workshop: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{user.workshopName}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Date: </span>
                            <span>{user.workshopDate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => setSelectedGeneratedCertRecord(user)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          <Award size={14} /> View Certificate
                        </button>

                        <button
                          className="btn-action-del"
                          onClick={() => onDeleteRecord(user.id)}
                          title="Delete User Record"
                        >
                          <Trash size={15} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <UserCheck size={48} />
                  <h3>No Users Found</h3>
                  <p>Try clearing filters or search query to view registered users.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN LIGHTBOX CERTIFICATE PREVIEW MODAL */}
      {selectedPreviewCert && (
        <div className="admin-modal-overlay" style={{ zIndex: 1200 }} onClick={() => setSelectedPreviewCert(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '750px', width: '90%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedPreviewCert(null)} title="Close Preview (Esc)">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {selectedPreviewCert.fileType} Certificate
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Roll No: <strong>{selectedPreviewCert.rollNumber || 'N/A'}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedPreviewCert.fileName}
              </h3>
              {selectedPreviewCert.studentName && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Student: <strong>{selectedPreviewCert.studentName}</strong>
                </p>
              )}
            </div>

            {/* Certificate Preview Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '420px',
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              {selectedPreviewCert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedPreviewCert.fileName || '') ? (
                <img
                  src={selectedPreviewCert.fileData}
                  alt={selectedPreviewCert.fileName}
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : selectedPreviewCert.fileType === 'pdf' || /\.pdf$/i.test(selectedPreviewCert.fileName || '') ? (
                <iframe
                  src={selectedPreviewCert.fileData}
                  title="PDF Preview"
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <FileSpreadsheet size={56} color="#d97706" style={{ margin: '0 auto 0.75rem' }} />
                  <h4>PowerPoint / Document File</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Click Download to view this file on your device.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Delete & Download (Icon-Only buttons) */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {onDeleteCertificate && (
                <button
                  className="btn-danger"
                  onClick={() => {
                    onDeleteCertificate(selectedPreviewCert.id);
                    setSelectedPreviewCert(null);
                  }}
                  title="Delete Certificate"
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => handleDownloadCert(selectedPreviewCert)}
                title="Download File"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={20} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC OFFICIAL RANBIDGE CERTIFICATE GENERATOR MODAL */}
      {selectedGeneratedCertRecord && (
        <div className="admin-modal-overlay" style={{ zIndex: 1250 }} onClick={() => setSelectedGeneratedCertRecord(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '900px', width: '92%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedGeneratedCertRecord(null)} title="Close Certificate (Esc)">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  Official RANBIDGE Certificate Generator
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Roll No: <strong>{selectedGeneratedCertRecord.rollNumber}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedGeneratedCertRecord.fullName}
              </h3>
            </div>

            <CertificateGenerator record={selectedGeneratedCertRecord} showActions={true} />
          </div>
        </div>
      )}

      {/* CREATE NEW DASHBOARD FOLDER MODAL */}
      {isAddFolderModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsAddFolderModalOpen(false)}>
          <div className="pin-modal-container" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setIsAddFolderModalOpen(false)} title="Close (Esc)">
              <X size={18} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fef9c3', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <FolderPlus size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Create Dashboard Folder</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Enter a name to add a new folder item to your File Explorer dashboard.</p>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem', textAlign: 'left' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. RANBIDGE Certificate Center, Church project..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }} onClick={() => setIsAddFolderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIGHT-CLICK FOLDER CONTEXT MENU */}
      {contextMenu.visible && contextMenu.folder && (
        <div
          className="folder-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              setOpenedFolderPage(contextMenu.folder);
              setContextMenu({ visible: false, x: 0, y: 0, folder: null });
            }}
          >
            <FolderOpen size={15} color="var(--primary)" />
            <span>Open Folder Page ({contextMenu.folder?.name})</span>
          </div>

          <div className="context-menu-divider" />

          {/* Cut Option */}
          <div
            className="context-menu-item"
            onClick={() => {
              const targets = selectedFolderIds.length > 1
                ? allFoldersList.filter(f => selectedFolderIds.includes(f.id))
                : [contextMenu.folder];
              handleCutFolders(targets);
            }}
          >
            <Scissors size={15} color="#d97706" />
            <span>Cut (Ctrl+X)</span>
          </div>

          {/* Copy Option */}
          <div
            className="context-menu-item"
            onClick={() => {
              const targets = selectedFolderIds.length > 1
                ? allFoldersList.filter(f => selectedFolderIds.includes(f.id))
                : [contextMenu.folder];
              handleCopyFolders(targets);
            }}
          >
            <Copy size={15} color="#0284c7" />
            <span>Copy (Ctrl+C)</span>
          </div>

          {/* Paste Option */}
          {folderClipboard.mode && folderClipboard.folders.length > 0 && (
            <div
              className="context-menu-item"
              onClick={() => handlePasteFolders(contextMenu.folder)}
            >
              <Clipboard size={15} color="#16a34a" />
              <span>Paste Here (Ctrl+V)</span>
            </div>
          )}

          <div className="context-menu-divider" />

          <div
            className="context-menu-item"
            onClick={() => handleOpenCreateWorkshop(contextMenu.folder)}
          >
            <Layers size={15} color="#0284c7" />
            <span>Create New Workshop / Event</span>
          </div>

          {selectedFolderIds.length === 1 && (
            <div
              className="context-menu-item"
              onClick={() => handleOpenRenameModal(contextMenu.folder)}
            >
              <Edit3 size={15} color="#d97706" />
              <span>Rename Folder</span>
            </div>
          )}

          <div className="context-menu-divider" />

          <div
            className="context-menu-item danger"
            onClick={() => {
              if (selectedFolderIds.length > 1) {
                handleDeleteSelectedFolders();
              } else {
                handleDeleteFolder(contextMenu.folder);
              }
            }}
          >
            <Trash2 size={15} color="#dc2626" />
            <span>
              {selectedFolderIds.length > 1 
                ? `Delete ${selectedFolderIds.length} Selected Folders` 
                : 'Delete Folder'}
            </span>
          </div>
        </div>
      )}

      {/* CREATE NEW WORKSHOP FORM MODAL */}
      {isWorkshopModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1400 }} onClick={() => setIsWorkshopModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '560px', width: '92%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setIsWorkshopModalOpen(false)} title="Close (Esc)">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Create New Workshop / Event</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                Fill in workshop details to create a dedicated workshop directory & verification drive.
              </p>
            </div>

            <form onSubmit={handleSaveWorkshop} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Workshop Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                  Workshop / Event Title *
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.85rem', width: '100%' }}
                  placeholder="e.g. AI & Full Stack Web Development BootCamp"
                  value={workshopForm.title}
                  onChange={(e) => setWorkshopForm(prev => ({ ...prev, title: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              {/* Row 1: College & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Organizing College / Institution
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.85rem', width: '100%' }}
                    placeholder="e.g. SRM Institute, VIT, JNTU..."
                    value={workshopForm.college}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, college: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Event Category
                  </label>
                  <select
                    className="admin-search-input"
                    style={{ width: '100%', cursor: 'pointer' }}
                    value={workshopForm.category}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Workshop">🛠️ Hands-on Workshop</option>
                    <option value="Hackathon">⚡ Hackathon</option>
                    <option value="BootCamp">🚀 BootCamp</option>
                    <option value="Seminar">🎤 Technical Seminar</option>
                    <option value="Certification Drive">📜 Certification Drive</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Department & Event Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Department / Stream
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.85rem', width: '100%' }}
                    placeholder="e.g. CSE, ECE, IT, Mechanical"
                    value={workshopForm.department}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Workshop Date
                  </label>
                  <input
                    type="date"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.85rem', width: '100%' }}
                    value={workshopForm.date}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3: Duration & Lead Instructor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Duration / Hours
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.85rem', width: '100%' }}
                    placeholder="e.g. 2 Days (16 Hours)"
                    value={workshopForm.duration}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                    Instructor / Trainer
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.85rem', width: '100%' }}
                    placeholder="e.g. RANBIDGE Senior Specialist"
                    value={workshopForm.trainer}
                    onChange={(e) => setWorkshopForm(prev => ({ ...prev, trainer: e.target.value }))}
                  />
                </div>
              </div>

              {/* Agenda / Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', textAlign: 'left' }}>
                  Agenda & Remarks (Optional)
                </label>
                <textarea
                  className="admin-search-input"
                  style={{ padding: '0.65rem 0.85rem', width: '100%', height: '70px', resize: 'vertical' }}
                  placeholder="Brief overview of activities, modules, or certification guidelines..."
                  value={workshopForm.description}
                  onChange={(e) => setWorkshopForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.7rem' }} onClick={() => setIsWorkshopModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Layers size={16} /> Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW FOLDER MODAL */}
      {isAddFolderModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1350 }} onClick={() => setIsAddFolderModalOpen(false)}>
          <div className="pin-modal-container" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setIsAddFolderModalOpen(false)} title="Close (Esc)">
              <X size={18} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <FolderPlus size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Create New Folder</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Enter a name to create a new folder in your directory.</p>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem', textAlign: 'left' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. Colleges, Workshops 2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }} onClick={() => setIsAddFolderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME FOLDER MODAL */}
      {renameModal.isOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1350 }} onClick={() => setRenameModal({ isOpen: false, folder: null, newName: '' })}>
          <div className="pin-modal-container" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setRenameModal({ isOpen: false, folder: null, newName: '' })} title="Close (Esc)">
              <X size={18} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Edit3 size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Rename Folder</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Enter a new name for folder <strong>"{renameModal.folder?.name}"</strong>.</p>
            </div>
            <form onSubmit={handleConfirmRename}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem', textAlign: 'left' }}>
                  New Folder Name
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.85rem' }}
                  value={renameModal.newName}
                  onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }} onClick={() => setRenameModal({ isOpen: false, folder: null, newName: '' })}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED OPENED FOLDER INSPECTOR PAGE MODAL */}
      {openedFolderPage && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1280, padding: 0 }} onClick={() => setOpenedFolderPage(null)}>
          <div
            className="admin-modal-container"
            style={{ position: 'relative', maxWidth: '100vw', width: '100vw', height: '100vh', maxHeight: '100vh', borderRadius: 0, padding: '1.75rem 2rem', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropFiles(e, openedFolderPage)}
          >
            {/* Drag & Drop Fullscreen Overlay Visual */}
            {isDraggingOver && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  border: '4px dashed #60a5fa',
                  padding: '2rem',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ background: '#2563eb', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.25rem', boxShadow: '0 0 35px rgba(37,99,235,0.7)' }}>
                  <UploadCloud size={56} color="#ffffff" />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Drop Certificates & Files Here!
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#93c5fd', marginTop: '0.5rem', maxWidth: '520px' }}>
                  Files will be automatically saved and stored inside <strong>"{openedFolderPage.name}"</strong> and displayed on this page immediately!
                </p>
              </div>
            )}
            
            {/* Header Breadcrumb Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>
                  <span style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }} onClick={() => setOpenedFolderPage(null)}>📁 Root Dashboard</span>
                  {openedFolderPage.parentName && (
                    <>
                      <ChevronRight size={14} />
                      <span
                        style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                        onClick={() => {
                          const parentObj = customFolders.find(f => f.id === openedFolderPage.parentId || (f.name && f.name.toLowerCase() === openedFolderPage.parentName.toLowerCase())) || { id: openedFolderPage.parentId, name: openedFolderPage.parentName };
                          setOpenedFolderPage(parentObj);
                        }}
                      >
                        📁 {openedFolderPage.parentName}
                      </span>
                    </>
                  )}
                  <ChevronRight size={14} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>📁 {openedFolderPage.name}</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📁</span> {openedFolderPage.name}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Folder Directory & Verification Files Inspector
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={folderFileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  onChange={handleDirectFolderUpload}
                />

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => folderFileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', background: '#8b5cf6', borderColor: '#7c3aed', borderRadius: 'var(--radius-md)' }}
                  title={`Upload Files / Certificates into "${openedFolderPage.name}"`}
                >
                  <UploadCloud size={18} />
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setOpenedFolderPage(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                  title="Return to Root Dashboard"
                >
                  <Building size={18} />
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleOpenAddStudentModal(openedFolderPage)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', background: '#2563eb', borderColor: '#1d4ed8', borderRadius: 'var(--radius-md)' }}
                  title="Add Registered Students Data"
                >
                  <UserPlus size={18} />
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleOpenImportVerifiedModal(openedFolderPage)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', background: '#059669', borderColor: '#047857', borderRadius: 'var(--radius-md)' }}
                  title="Import Verified Students"
                >
                  <FileSpreadsheet size={18} />
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddFolderModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                  title="Create New Sub-Folder"
                >
                  <FolderPlus size={18} />
                </button>

                <button className="btn-icon-close" onClick={() => setOpenedFolderPage(null)} title="Close Folder View (Esc)">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sub-Folders Directory inside current location */}
            {openedFolderSubFolders.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Folder color="#eab308" size={16} /> Sub-Folders in "{openedFolderPage.name}" ({openedFolderSubFolders.length})
                  </h4>
                </div>

                <div className="folders-grid" style={{ marginBottom: '0.5rem' }}>
                    {openedFolderSubFolders.map((subFolder) => {
                      const isSelected = selectedFolderIds.includes(subFolder.id);
                      const isCut = folderClipboard.mode === 'cut' && folderClipboard.folders.some(f => f.id === subFolder.id || f.name.toLowerCase() === subFolder.name.toLowerCase());
                      return (
                        <div
                          key={subFolder.id}
                          className={`folder-grid-item ${isSelected ? 'active' : ''}`}
                          style={isCut ? { opacity: 0.5, borderStyle: 'dashed', borderColor: '#d97706' } : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFolderIds([subFolder.id]);
                          }}
                          onDoubleClick={() => setOpenedFolderPage(subFolder)}
                          onContextMenu={(e) => {
                            if (!selectedFolderIds.includes(subFolder.id)) {
                              setSelectedFolderIds([subFolder.id]);
                            }
                            handleFolderContextMenu(e, subFolder);
                          }}
                          title={`Sub-Folder: ${subFolder.name} (Single-click to select, Double-click to open)`}
                        >
                      <span className="folder-icon-img">📁</span>
                      <span className="folder-item-name">{subFolder.name}</span>
                      <button
                        type="button"
                        className="folder-options-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFolderContextMenu(e, subFolder);
                        }}
                        title="Sub-folder options"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            {/* Student Records Table Section */}
            {openedFolderRecords.length > 0 && (
              <div style={{ marginTop: openedFolderSubFolders.length > 0 ? '1.5rem' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={16} color="var(--primary)" /> Student Records ({openedFolderRecords.length})
                  </h4>

                  {selectedStudentIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginRight: '0.2rem' }}>
                        {selectedStudentIds.length} Selected
                      </span>

                      {/* Accept All Selected Icon Button (Green) */}
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={handleBulkApproveAndSend}
                        style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#16a34a', borderColor: '#15803d', borderRadius: '6px' }}
                        title={`Accept All Selected (${selectedStudentIds.length}) & Send to User Portal`}
                      >
                        <UserCheck size={16} />
                      </button>

                      {/* Reject All Selected Icon Button (Red) */}
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={handleBulkReject}
                        style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#dc2626', borderColor: '#b91c1c', borderRadius: '6px' }}
                        title={`Reject All Selected (${selectedStudentIds.length}) Students`}
                      >
                        <X size={16} />
                      </button>

                      {/* Download Selected Certificates Icon Button (Blue) */}
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={handleBulkDownloadCertificates}
                        style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', borderColor: '#2563eb', borderRadius: '6px' }}
                        title={`Download Certificates (${selectedStudentIds.length})`}
                      >
                        <Download size={16} />
                      </button>

                      {/* Deselect All Icon Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds([])}
                        style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        title="Deselect All"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="admin-table-wrapper" style={{ maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', minHeight: '500px', width: '100%' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            title="Select All Folder Students"
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            checked={openedFolderRecords.length > 0 && openedFolderRecords.every(r => selectedStudentIds.includes(r.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const allIds = Array.from(new Set([...selectedStudentIds, ...openedFolderRecords.map(r => r.id)]));
                                setSelectedStudentIds(allIds);
                              } else {
                                const currentIds = new Set(openedFolderRecords.map(r => r.id));
                                setSelectedStudentIds(selectedStudentIds.filter(id => !currentIds.has(id)));
                              }
                            }}
                          />
                        </th>
                        <th>#</th>
                        <th>Participant Name</th>
                        <th>Roll Number</th>
                        <th>College</th>
                        <th>Department</th>
                        <th>Passout</th>
                        <th>Workshop</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openedFolderRecords.map((rec, i) => {
                        const isVerified = rec.verificationStatus === 'verified';
                        return (
                          <tr 
                            key={rec.id || i}
                            onClick={() => setViewingStudentDetail(rec)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view full student registration credentials & certificate"
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                checked={selectedStudentIds.includes(rec.id)}
                                onChange={() => {
                                  if (selectedStudentIds.includes(rec.id)) {
                                    setSelectedStudentIds(selectedStudentIds.filter(id => id !== rec.id));
                                  } else {
                                    setSelectedStudentIds([...selectedStudentIds, rec.id]);
                                  }
                                }}
                              />
                            </td>
                            <td><strong>{i + 1}</strong></td>
                            <td><strong>{rec.fullName}</strong></td>
                            <td><code>{rec.rollNumber}</code></td>
                            <td>{rec.college}</td>
                            <td>{rec.department}</td>
                            <td>{rec.passoutYear}</td>
                            <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{rec.workshopName}</span></td>
                            <td>
                              {isVerified ? (
                                <span
                                  title="Verified & Accepted"
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '0.35rem',
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #86efac'
                                  }}
                                >
                                  <CheckCircle2 size={15} />
                                </span>
                              ) : (
                                <span
                                  title="Pending Verification"
                                  style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    padding: '0.35rem',
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #fde68a'
                                  }}
                                >
                                  <Clock size={15} />
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-primary btn-sm"
                                  onClick={() => onVerifyRecord && onVerifyRecord(rec.id)}
                                  title={isVerified ? "Already Accepted & Verified" : "Accept Registration & Generate Certificate"}
                                  style={{
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    background: isVerified ? '#15803d' : '#16a34a',
                                    borderColor: '#15803d',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <UserCheck size={15} color="#ffffff" />
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-del"
                                  onClick={() => onDeleteRecord(rec.id)}
                                  title="Cancel / Delete Record"
                                  style={{
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    background: '#ef4444',
                                    borderColor: '#dc2626',
                                    color: '#ffffff',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={15} color="#ffffff" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Uploaded Certificates & Files Grid Section */}
            {openedFolderCertificates.length > 0 && (
              <div style={{ marginBottom: '1.5rem', marginTop: openedFolderSubFolders.length > 0 ? '1.25rem' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Award color="#2563eb" size={17} /> Uploaded Certificates & Files ({openedFolderCertificates.length})
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {openedFolderCertificates.map((cert) => {
                    const isImg = cert.fileType === 'image' || (cert.fileData && cert.fileData.startsWith('data:image'));
                    const isPdf = cert.fileType === 'pdf' || (cert.fileName && cert.fileName.toLowerCase().endsWith('.pdf'));

                    return (
                      <div
                        key={cert.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          <div
                            onClick={() => setSelectedPreviewCert(cert)}
                            style={{
                              height: '110px',
                              background: '#f8fafc',
                              borderRadius: '7px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              marginBottom: '0.6rem',
                              cursor: 'pointer',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {isImg ? (
                              <img src={cert.fileData} alt={cert.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : isPdf ? (
                              <div style={{ textAlign: 'center', color: '#dc2626' }}>
                                <FileText size={38} />
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, marginTop: '0.2rem', textTransform: 'uppercase' }}>PDF Document</div>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#2563eb' }}>
                                <Award size={38} />
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, marginTop: '0.2rem' }}>Certificate File</div>
                              </div>
                            )}
                          </div>

                          <h5
                            title={cert.fileName}
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              margin: '0 0 0.3rem 0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {cert.fileName}
                          </h5>

                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {cert.studentName && cert.studentName !== cert.fileName && (
                              <span>👤 {cert.studentName}</span>
                            )}
                            {cert.rollNumber && cert.rollNumber !== 'N/A' && (
                              <span>🆔 <code>{cert.rollNumber}</code></span>
                            )}
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>📅 {cert.uploadedAt || 'Recently'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => setSelectedPreviewCert(cert)}
                            style={{ flex: 1, padding: '0.25rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                            title="Preview Certificate File"
                          >
                            👁️ View
                          </button>
                          {cert.fileData && (
                            <a
                              href={cert.fileData}
                              download={cert.fileName}
                              className="btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.4rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                              title="Download File"
                            >
                              <Download size={13} />
                            </a>
                          )}
                          {onDeleteCertificate && (
                            <button
                              type="button"
                              className="btn-action-del"
                              onClick={() => {
                                if (window.confirm(`Delete certificate "${cert.fileName}"?`)) {
                                  onDeleteCertificate(cert.id);
                                }
                              }}
                              style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', cursor: 'pointer' }}
                              title="Delete Certificate File"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State if neither sub-folders, certificates, nor records exist */}
            {openedFolderSubFolders.length === 0 && openedFolderCertificates.length === 0 && openedFolderRecords.length === 0 && (
              <div
                className="admin-empty-state"
                onClick={() => folderFileInputRef.current?.click()}
                style={{ cursor: 'pointer', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '3rem 1.5rem', background: '#f8fafc', transition: 'all 0.2s ease' }}
              >
                <UploadCloud size={48} color="var(--primary)" />
                <h3 style={{ marginTop: '0.75rem' }}>Drag & Drop Certificates / Files Here</h3>
                <p>Or click anywhere in this box to upload certificates directly into "{openedFolderPage.name}".</p>
                <button type="button" className="btn-primary" style={{ marginTop: '0.75rem', background: '#8b5cf6', borderColor: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UploadCloud size={16} /> Choose Files to Upload
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ADD REGISTERED STUDENT DATA MODAL */}
      {isAddStudentModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1350 }} onClick={() => setIsAddStudentModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '520px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Add Registered Student Data</h3>
              </div>
              <button className="btn-icon-close" onClick={() => setIsAddStudentModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Manually add a student registration record into <strong>{openedFolderPage ? openedFolderPage.name : 'Root Dashboard'}</strong>.
            </p>

            <form onSubmit={handleSaveAddStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.75rem' }}
                    placeholder="e.g. Aarav Sharma"
                    value={addStudentForm.fullName}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Roll Number *</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.75rem' }}
                    placeholder="e.g. 23471A1234"
                    value={addStudentForm.rollNumber}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>College / Institution</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.75rem' }}
                  placeholder="College Name"
                  value={addStudentForm.college}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, college: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Department</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.75rem' }}
                    placeholder="e.g. CSE"
                    value={addStudentForm.department}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Passout Year</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ paddingLeft: '0.75rem' }}
                    placeholder="2026"
                    value={addStudentForm.passoutYear}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, passoutYear: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Workshop Name</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ paddingLeft: '0.75rem' }}
                  placeholder="Workshop Title"
                  value={addStudentForm.workshopName}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, workshopName: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={addStudentForm.isVerified}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                  />
                  <span>Mark as Verified & Generate Certificate Immediately</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }} onClick={() => setIsAddStudentModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem', background: '#2563eb' }}>
                  <UserPlus size={16} /> Save Student Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT VERIFIED STUDENTS BULK MODAL */}
      {isImportVerifiedModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1350 }} onClick={() => setIsImportVerifiedModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '620px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={22} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Import Verified Students</h3>
              </div>
              <button className="btn-icon-close" onClick={() => setIsImportVerifiedModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Paste roll numbers and student details below (CSV / list format). All imported students will be <strong>automatically verified and issued official certificates</strong>.
            </p>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', color: '#065f46', marginBottom: '1rem' }}>
              <strong>Format per line:</strong> <code>RollNumber, Full Name, College, Department, PassoutYear</code>
            </div>

            <form onSubmit={handleConfirmImportVerified}>
              <div style={{ marginBottom: '1.25rem' }}>
                <textarea
                  className="admin-search-input"
                  style={{ padding: '0.85rem', height: '160px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                  placeholder="23471A1201, Aarav Sharma, IIT Madras, CSE, 2026&#10;23471A1202, Priya Ananth, Anna University, ECE, 2027"
                  value={importVerifiedText}
                  onChange={(e) => setImportVerifiedText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }} onClick={() => setIsImportVerifiedModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem', background: '#059669', borderColor: '#047857' }}>
                  <FileSpreadsheet size={16} /> Import & Verify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADDED COLLEGES DIRECTORY MODAL */}
      {isCollegesDirectoryModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsCollegesDirectoryModalOpen(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '850px', width: '92%', padding: '1.75rem', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: '#dcfce7', color: '#15803d', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Added Colleges Directory ({collegeBreakdown.filter(c => c.name !== 'Unspecified College' || c.records.length > 0).length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    View and inspect all colleges registered in the portal.
                  </p>
                </div>
              </div>
              <button className="btn-icon-close" onClick={() => setIsCollegesDirectoryModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="admin-search-wrapper" style={{ marginBottom: '1.25rem' }}>
              <Search className="search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search added college by name..."
                value={collegeSearchInput}
                onChange={(e) => setCollegeSearchInput(e.target.value)}
                autoFocus
              />
            </div>

            {/* Colleges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {collegeBreakdown
                .filter(col => !collegeSearchInput || col.name.toLowerCase().includes(collegeSearchInput.toLowerCase().trim()))
                .map((col, idx) => {
                  const verifiedCount = col.records.filter(r => r.verificationStatus === 'verified').length;
                  const totalCount = col.records.length;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1.1rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.45rem', borderRadius: '8px' }}>
                              <Building size={18} />
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                              {col.name}
                            </h4>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                            👥 {totalCount} Students
                          </span>
                          <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                            ✅ {verifiedCount} Verified
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.45rem' }}
                          onClick={() => {
                            setIsCollegesDirectoryModalOpen(false);
                            setOpenedFolderPage({ id: `col-${col.name}`, name: col.name, type: 'college' });
                          }}
                        >
                          <FolderOpen size={14} /> View Folder
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}
                          onClick={() => {
                            setIsCollegesDirectoryModalOpen(false);
                            setColumnFilters(prev => ({ ...prev, college: [col.name] }));
                          }}
                          title="Filter registrations table"
                        >
                          Filter
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      )}

      {/* STUDENT REGISTRATION PROFILE DETAILS MODAL */}
      {viewingStudentDetail && (
        <div className="admin-modal-overlay" style={{ zIndex: 1400 }} onClick={() => setViewingStudentDetail(null)}>
          <div className="admin-modal-container" style={{ maxWidth: '850px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', background: '#ffffff', color: 'var(--text-main)', borderRadius: 'var(--radius-xl)', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setViewingStudentDetail(null)} title="Close Details (Esc)">
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'left', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {safeVal(viewingStudentDetail.fullName || viewingStudentDetail.studentName || viewingStudentDetail.name, 'Participant Details')}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      Registration ID: <code style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{safeVal(viewingStudentDetail.id || viewingStudentDetail.rollNumber, 'N/A')}</code>
                    </p>
                  </div>
                </div>

                {viewingStudentDetail.verificationStatus === 'verified' ? (
                  <span style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '0.4rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid #86efac'
                  }}>
                    <ShieldCheck size={16} /> VERIFIED & RELEASED
                  </span>
                ) : (
                  <span style={{
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '0.4rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid #fde68a'
                  }}>
                    <Clock size={16} /> PENDING ADMIN VERIFICATION
                  </span>
                )}
              </div>
            </div>

            {/* Registration Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Roll Number
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {safeVal(viewingStudentDetail.rollNumber, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  College / Institution
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {safeVal(viewingStudentDetail.college, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Department / Branch
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {safeVal(viewingStudentDetail.department, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Passout Year
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {safeVal(viewingStudentDetail.passoutYear, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Event / Workshop
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {safeVal(viewingStudentDetail.workshopName, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Event Date
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {safeVal(viewingStudentDetail.workshopDate, 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Submitted Timestamp
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {formatTimestamp(viewingStudentDetail.submittedAt || viewingStudentDetail.timestamp)}
                </span>
              </div>

              {viewingStudentDetail.verifiedAt && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Verified Timestamp
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>
                    {formatTimestamp(viewingStudentDetail.verifiedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Official Generated Certificate Section */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--primary)" />
                Official Certificate Preview & Actions
              </h4>
              <CertificateGenerator record={viewingStudentDetail} showActions={true} showToast={showToast} />
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewingStudentDetail(null)}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Close
              </button>

              {viewingStudentDetail.verificationStatus !== 'verified' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (onVerifyRecord) onVerifyRecord(viewingStudentDetail.id);
                    setViewingStudentDetail(prev => prev ? { ...prev, verificationStatus: 'verified', verifiedAt: new Date().toLocaleString() } : null);
                  }}
                  style={{ padding: '0.65rem 1.5rem', background: '#16a34a', borderColor: '#15803d' }}
                >
                  <UserCheck size={18} />
                  <span>Accept Registration & Verify</span>
                </button>
              )}

              <button
                type="button"
                className="btn-action-del"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete registration for ${viewingStudentDetail.fullName}?`)) {
                    if (onDeleteRecord) onDeleteRecord(viewingStudentDetail.id);
                    setViewingStudentDetail(null);
                  }
                }}
                style={{ padding: '0.65rem 1.25rem', background: '#dc2626', borderColor: '#b91c1c', color: '#ffffff', borderRadius: 'var(--radius-md)' }}
              >
                <Trash size={16} />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Dropdowns & Directory Options Manager Modal */}
      {isFormSettingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormSettingsModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '750px', 
              width: '95%', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '0', 
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Settings size={22} color="#a78bfa" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                    Student Form Options Manager
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', opacity: 0.85, color: '#c7d2fe' }}>
                    Configure pre-populated options for College Name, Workshop Title, and Department dropdowns
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormSettingsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  opacity: 0.8,
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{
              display: 'flex',
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-color)',
              padding: '0 1.25rem'
            }}>
              <button
                onClick={() => setActiveSettingsTab('colleges')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeSettingsTab === 'colleges' ? '3px solid #6366f1' : '3px solid transparent',
                  color: activeSettingsTab === 'colleges' ? '#4f46e5' : 'var(--text-muted)',
                  fontWeight: activeSettingsTab === 'colleges' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <Building size={16} />
                <span>Colleges / Institutes ({currentColleges.length})</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('workshops')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeSettingsTab === 'workshops' ? '3px solid #6366f1' : '3px solid transparent',
                  color: activeSettingsTab === 'workshops' ? '#4f46e5' : 'var(--text-muted)',
                  fontWeight: activeSettingsTab === 'workshops' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <Award size={16} />
                <span>Workshop Titles ({currentWorkshops.length})</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('departments')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeSettingsTab === 'departments' ? '3px solid #6366f1' : '3px solid transparent',
                  color: activeSettingsTab === 'departments' ? '#4f46e5' : 'var(--text-muted)',
                  fontWeight: activeSettingsTab === 'departments' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <GraduationCap size={16} />
                <span>Departments ({currentDepartments.length})</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* COLLEGES TAB */}
              {activeSettingsTab === 'colleges' && (
                <div>
                  <form onSubmit={handleAddCollege} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add new college / institute name..."
                      value={newCollegeInput}
                      onChange={e => setNewCollegeInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                      <Plus size={16} /> Add College
                    </button>
                  </form>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    PRE-SET COLLEGES & INSTITUTES ({currentColleges.length}):
                  </div>

                  {currentColleges.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      No colleges added yet. Use the input above to add college names.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto' }}>
                      {currentColleges.map((col, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.9rem',
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{col}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCollege(col)}
                            title="Remove college from list"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WORKSHOPS TAB */}
              {activeSettingsTab === 'workshops' && (
                <div>
                  <form onSubmit={handleAddWorkshop} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add new workshop title..."
                      value={newWorkshopInput}
                      onChange={e => setNewWorkshopInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                      <Plus size={16} /> Add Workshop
                    </button>
                  </form>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    PRE-SET WORKSHOP TITLES ({currentWorkshops.length}):
                  </div>

                  {currentWorkshops.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      No workshop titles added yet. Use the input above to add workshop titles.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto' }}>
                      {currentWorkshops.map((w, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.9rem',
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{w}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteWorkshop(w)}
                            title="Remove workshop title from list"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DEPARTMENTS TAB */}
              {activeSettingsTab === 'departments' && (
                <div>
                  <form onSubmit={handleAddDepartment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add new department name (e.g., CSE, ECE)..."
                      value={newDepartmentInput}
                      onChange={e => setNewDepartmentInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                      <Plus size={16} /> Add Department
                    </button>
                  </form>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    PRE-SET DEPARTMENTS ({currentDepartments.length}):
                  </div>

                  {currentDepartments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      No departments added yet. Use the input above to add department names.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto' }}>
                      {currentDepartments.map((dept, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.9rem',
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{dept}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(dept)}
                            title="Remove department from list"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Changes are automatically saved and immediately available in the Student Registration Form dropdowns.
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsFormSettingsModalOpen(false)}
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
