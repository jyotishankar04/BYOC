// Central dummy data store — import from here, not from individual pages.

// ─── User ─────────────────────────────────────────────────────────────────────

export const CURRENT_USER = {
  name: "John Doe",
  email: "john@example.com",
  initials: "JD",
  role: "Owner",
  location: "Mumbai, India",
  phone: "+91 98765 43210",
  website: "https://johndoe.dev",
  bio: "Cloud infrastructure enthusiast. Building BYOC to manage storage across providers.",
} as const

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CONNECTED_PROVIDER = {
  name: "AWS S3",
  region: "ap-south-1",
  bucket: "byoc-user-storage",
  status: "Connected",
} as const

// ─── Stats ────────────────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  storageUsed: "128.4 GB",
  totalFiles: "2,430",
  estimatedCost: "$4.82",
  sharedLinks: "18",
} as const

// ─── Storage breakdown ────────────────────────────────────────────────────────

export const STORAGE_TOTAL_GB = 128.4

export const STORAGE_CATEGORIES = [
  { label: "Videos",    used: 61,  color: "bg-blue-500",   progressCls: "[&>[data-slot=progress-indicator]]:bg-blue-500",   chartColor: "#3b82f6" },
  { label: "Images",    used: 42,  color: "bg-violet-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-violet-500", chartColor: "#8b5cf6" },
  { label: "Documents", used: 18,  color: "bg-amber-500",  progressCls: "[&>[data-slot=progress-indicator]]:bg-amber-500",  chartColor: "#f59e0b" },
  { label: "Others",    used: 7.4, color: "bg-slate-400",  progressCls: "[&>[data-slot=progress-indicator]]:bg-slate-400",  chartColor: "#94a3b8" },
] as const

// ─── Recent files (dashboard) ─────────────────────────────────────────────────

export const RECENT_FILES = [
  { name: "project-demo.mp4",  type: "Video",    size: "42 MB",  uploadedAt: "Today",      status: "Private" },
  { name: "invoice.pdf",       type: "Document", size: "2.1 MB", uploadedAt: "Yesterday",  status: "Shared"  },
  { name: "profile-image.png", type: "Image",    size: "840 KB", uploadedAt: "2 days ago", status: "Private" },
  { name: "notes.zip",         type: "Archive",  size: "18 MB",  uploadedAt: "3 days ago", status: "Private" },
] as const

// ─── Recent activity (dashboard) ──────────────────────────────────────────────

export const RECENT_ACTIVITY_ITEMS = [
  { action: "Uploaded project-demo.mp4",     time: "Just now",    type: "upload"  },
  { action: "Shared invoice.pdf",            time: "2 hours ago", type: "share"   },
  { action: "Created folder 'College Notes'",time: "Yesterday",   type: "folder"  },
  { action: "Connected AWS S3 bucket",       time: "3 days ago",  type: "connect" },
] as const

// ─── Analytics ────────────────────────────────────────────────────────────────

export const STORAGE_TREND = [
  { month: "Nov", used: 42  },
  { month: "Dec", used: 58  },
  { month: "Jan", used: 71  },
  { month: "Feb", used: 89  },
  { month: "Mar", used: 104 },
  { month: "Apr", used: 118 },
  { month: "May", used: 128 },
]

export const UPLOAD_ACTIVITY = [
  { day: "Mon", uploads: 12, downloads: 5  },
  { day: "Tue", uploads: 28, downloads: 14 },
  { day: "Wed", uploads: 9,  downloads: 21 },
  { day: "Thu", uploads: 34, downloads: 8  },
  { day: "Fri", uploads: 19, downloads: 32 },
  { day: "Sat", uploads: 7,  downloads: 4  },
  { day: "Sun", uploads: 3,  downloads: 2  },
]

export const TOP_SHARED_LINKS = [
  { name: "project-demo.mp4",  visits: 248, trend: "+18%", type: "Video"    },
  { name: "design-assets.zip", visits: 134, trend: "+6%",  type: "Archive"  },
  { name: "invoice-q1.pdf",    visits: 97,  trend: "-3%",  type: "Document" },
  { name: "team-photo.png",    visits: 56,  trend: "+42%", type: "Image"    },
  { name: "presentation.pptx", visits: 31,  trend: "+11%", type: "Slides"   },
]

// ─── Notifications (quick panel) ──────────────────────────────────────────────

export type NotifType = "upload" | "share" | "storage" | "connect" | "system"

export interface QuickNotification {
  id: string
  title: string
  time: string
  read: boolean
  type: NotifType
}

export const QUICK_NOTIFICATIONS: QuickNotification[] = [
  { id: "q1", type: "upload",  title: "project-demo.mp4 uploaded successfully",   time: "Just now",    read: false },
  { id: "q2", type: "share",   title: "invoice.pdf shared via public link",        time: "2 hours ago", read: false },
  { id: "q3", type: "storage", title: "Storage usage reached 78% of limit",        time: "Yesterday",   read: false },
  { id: "q4", type: "connect", title: "AWS S3 bucket connected successfully",      time: "2 days ago",  read: true  },
  { id: "q5", type: "system",  title: "Scheduled maintenance on May 15",           time: "3 days ago",  read: true  },
]

// ─── Upload dialog folders ─────────────────────────────────────────────────────

export const UPLOAD_FOLDERS = [
  { value: "root",                label: "Root"                },
  { value: "projects",            label: "Projects"            },
  { value: "finance",             label: "Finance"             },
  { value: "reports",             label: "Reports"             },
  { value: "personal",            label: "Personal"            },
] as const
