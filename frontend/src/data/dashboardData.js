// Dummy data used across the dashboard when live API data is not available

export const sparklineRevenue = [2.1, 3.4, 2.8, 4.1, 3.9, 5.2, 4.8, 6.1];
export const sparklineLeads = [12, 18, 14, 22, 19, 26, 23, 29];
export const sparklineDeals = [1, 2, 1, 3, 2, 4, 3, 5];
export const sparklineValue = [60, 72, 65, 80, 76, 88, 82, 95];

export const revenueChartData = [
  { month: "Sep", revenue: 12400000, deals: 3 },
  { month: "Oct", revenue: 18900000, deals: 5 },
  { month: "Nov", revenue: 14200000, deals: 4 },
  { month: "Dec", revenue: 21500000, deals: 6 },
  { month: "Jan", revenue: 19800000, deals: 5 },
  { month: "Feb", revenue: 26300000, deals: 7 },
];

export const funnelData = [
  { stage: "New Leads", value: 120, color: "#3b82f6" },
  { stage: "Contacted", value: 88, color: "#6366f1" },
  { stage: "Site Visits", value: 54, color: "#f59e0b" },
  { stage: "Negotiation", value: 31, color: "#f97316" },
  { stage: "Closed", value: 18, color: "#10b981" },
];

export const recentLeads = [
  {
    id: 1,
    name: "Ahmed Raza",
    budget: "Rs. 1.2 Cr",
    location: "DHA Phase 6",
    agent: "Sarah Ali",
    status: "new",
    avatar: "AR",
  },
  {
    id: 2,
    name: "Fatima Malik",
    budget: "Rs. 85 L",
    location: "Bahria Town",
    agent: "Omar Khan",
    status: "contacted",
    avatar: "FM",
  },
  {
    id: 3,
    name: "Bilal Hussain",
    budget: "Rs. 2.5 Cr",
    location: "Gulberg III",
    agent: "Sarah Ali",
    status: "negotiation",
    avatar: "BH",
  },
  {
    id: 4,
    name: "Zara Sheikh",
    budget: "Rs. 65 L",
    location: "E-11 Sector",
    agent: "Admin",
    status: "visit",
    avatar: "ZS",
  },
  {
    id: 5,
    name: "Hassan Nawaz",
    budget: "Rs. 3.1 Cr",
    location: "F-7 Markaz",
    agent: "Omar Khan",
    status: "closed",
    avatar: "HN",
  },
];

export const topAgent = {
  name: "Sarah Ali",
  title: "Senior Property Executive",
  dealsThisMonth: 7,
  revenue: "Rs. 28.4M",
  conversionRate: "68%",
  avatar: "SA",
  badge: "Top Performer",
};

export const todayOps = {
  siteVisits: 4,
  pendingFollowups: 11,
  newLeadsToday: 3,
  closingSoon: 2,
};

export const statusColors = {
  new: "badge-blue",
  contacted: "badge-purple",
  visit: "badge-amber",
  negotiation: "badge-amber",
  closed: "badge-green",
  lost: "badge-red",
};
