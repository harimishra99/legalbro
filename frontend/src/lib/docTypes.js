export const DOC_TYPES = {
  "Core Legal": [
    {
      id: "nda", name: "NDA", icon: "🤝", desc: "Non-Disclosure Agreement",
      fields: [
        { id: "disclosing", label: "Disclosing Party", ph: "Company / Person name" },
        { id: "receiving", label: "Receiving Party", ph: "Company / Person name" },
        { id: "purpose", label: "Purpose of Disclosure", ph: "e.g. Product development discussions", full: true },
        { id: "duration", label: "Duration", ph: "e.g. 2 years" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Delhi, India" },
      ],
    },
    {
      id: "mou", name: "MOU", icon: "📋", desc: "Memorandum of Understanding",
      fields: [
        { id: "party1", label: "Party 1", ph: "Full legal name" },
        { id: "party2", label: "Party 2", ph: "Full legal name" },
        { id: "objective", label: "Objective", ph: "Purpose of the MOU", full: true },
        { id: "duration", label: "Duration", ph: "e.g. 1 year" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Mumbai, India" },
      ],
    },
    {
      id: "service", name: "Service Agreement", icon: "🔧", desc: "Service / Consulting Agreement",
      fields: [
        { id: "provider", label: "Service Provider", ph: "Company or individual name" },
        { id: "client", label: "Client", ph: "Client company or name" },
        { id: "services", label: "Services Description", ph: "Detailed description of services", full: true },
        { id: "fee", label: "Fee & Payment Terms", ph: "e.g. ₹50,000/month, 30-day net", full: true },
        { id: "duration", label: "Duration", ph: "e.g. 6 months" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Bangalore, India" },
      ],
    },
    {
      id: "rent", name: "Rent Agreement", icon: "🏠", desc: "Residential / Commercial Lease",
      fields: [
        { id: "landlord", label: "Landlord", ph: "Full name" },
        { id: "tenant", label: "Tenant", ph: "Full name" },
        { id: "property", label: "Property Address", ph: "Full address", full: true },
        { id: "rent", label: "Monthly Rent", ph: "e.g. ₹25,000" },
        { id: "deposit", label: "Security Deposit", ph: "e.g. ₹75,000" },
        { id: "duration", label: "Duration", ph: "e.g. 11 months" },
        { id: "start_date", label: "Start Date", ph: "e.g. 01 June 2025" },
      ],
    },
    {
      id: "employment", name: "Employment Letter", icon: "💼", desc: "Offer / Appointment Letter",
      fields: [
        { id: "company", label: "Employer Company", ph: "Company name" },
        { id: "employee", label: "Employee Name", ph: "Full name" },
        { id: "designation", label: "Designation", ph: "e.g. Software Engineer" },
        { id: "salary", label: "Salary (CTC)", ph: "e.g. ₹8,00,000 per annum" },
        { id: "joining", label: "Joining Date", ph: "e.g. 01 July 2025" },
        { id: "location", label: "Work Location", ph: "e.g. New Delhi" },
      ],
    },
    {
      id: "partnership", name: "Partnership Deed", icon: "🤜", desc: "Business Partnership Deed",
      fields: [
        { id: "partner1", label: "Partner 1", ph: "Full legal name" },
        { id: "partner2", label: "Partner 2", ph: "Full legal name" },
        { id: "biz_name", label: "Business Name", ph: "Firm name" },
        { id: "biz_type", label: "Business Type", ph: "e.g. Trading, IT Services" },
        { id: "profit_ratio", label: "Profit Sharing Ratio", ph: "e.g. 60:40" },
        { id: "duration", label: "Duration", ph: "e.g. 5 years or indefinite" },
      ],
    },
  ],
  "Business & Corporate": [
    {
      id: "freelancer", name: "Freelancer Contract", icon: "💻", desc: "Freelance Work Agreement",
      fields: [
        { id: "freelancer", label: "Freelancer Name", ph: "Full name" },
        { id: "client", label: "Client", ph: "Company or person" },
        { id: "project", label: "Project Description", ph: "Scope of work", full: true },
        { id: "fee", label: "Project Fee", ph: "e.g. ₹80,000 fixed" },
        { id: "deadline", label: "Deadline", ph: "e.g. 30 days from start" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Delhi, India" },
      ],
    },
    {
      id: "vendor", name: "Vendor Agreement", icon: "🏪", desc: "Vendor / Supplier Contract",
      fields: [
        { id: "vendor", label: "Vendor Name", ph: "Company name" },
        { id: "buyer", label: "Buyer Company", ph: "Company name" },
        { id: "goods_services", label: "Goods / Services", ph: "Description of supply", full: true },
        { id: "payment", label: "Payment Terms", ph: "e.g. Net 30, advance 50%" },
        { id: "duration", label: "Duration", ph: "e.g. 1 year" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Pune, India" },
      ],
    },
    {
      id: "consultancy", name: "Consultancy Agreement", icon: "🎯", desc: "Advisory / Consulting Contract",
      fields: [
        { id: "consultant", label: "Consultant / Firm", ph: "Name" },
        { id: "company", label: "Client Company", ph: "Company name" },
        { id: "scope", label: "Scope of Consultancy", ph: "Area of advice", full: true },
        { id: "retainer", label: "Retainer / Fee", ph: "e.g. ₹1,00,000/month" },
        { id: "duration", label: "Duration", ph: "e.g. 12 months" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Chennai, India" },
      ],
    },
    {
      id: "share_purchase", name: "Share Purchase Agreement", icon: "📈", desc: "SPA for Share Transfer",
      fields: [
        { id: "seller", label: "Seller", ph: "Name / Entity" },
        { id: "buyer", label: "Buyer", ph: "Name / Entity" },
        { id: "company", label: "Target Company", ph: "Company name" },
        { id: "shares", label: "Number of Shares", ph: "e.g. 10,000 equity shares" },
        { id: "price", label: "Purchase Price", ph: "e.g. ₹50,00,000" },
        { id: "closing", label: "Closing Date", ph: "e.g. 15 August 2025" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Mumbai, India" },
      ],
    },
    {
      id: "term_sheet", name: "Term Sheet", icon: "📄", desc: "Investment / Deal Term Sheet",
      fields: [
        { id: "investor", label: "Investor / Party", ph: "Name / Fund" },
        { id: "company", label: "Company", ph: "Startup / Company name" },
        { id: "amount", label: "Investment Amount", ph: "e.g. ₹2 Crore" },
        { id: "instrument", label: "Instrument", ph: "e.g. CCPS, SAFE, Equity" },
        { id: "valuation", label: "Valuation", ph: "e.g. Pre-money ₹10 Crore" },
        { id: "terms", label: "Key Terms", ph: "Any specific terms", full: true },
      ],
    },
  ],
  "Employment & HR": [
    {
      id: "internship", name: "Internship Agreement", icon: "🎓", desc: "Internship Offer Letter",
      fields: [
        { id: "company", label: "Company", ph: "Company name" },
        { id: "intern", label: "Intern Name", ph: "Full name" },
        { id: "role", label: "Role / Department", ph: "e.g. Software Intern, Marketing" },
        { id: "stipend", label: "Stipend", ph: "e.g. ₹15,000/month or unpaid" },
        { id: "duration", label: "Duration", ph: "e.g. 3 months" },
        { id: "start_date", label: "Start Date", ph: "e.g. 01 June 2025" },
      ],
    },
    {
      id: "non_compete", name: "Non-Compete Agreement", icon: "🚫", desc: "Restrictive Covenant",
      fields: [
        { id: "employee", label: "Employee / Party", ph: "Full name" },
        { id: "employer", label: "Employer / Company", ph: "Company name" },
        { id: "scope", label: "Restricted Activities", ph: "What they cannot do", full: true },
        { id: "duration", label: "Restriction Duration", ph: "e.g. 1 year post-employment" },
        { id: "geography", label: "Geographic Scope", ph: "e.g. India / Delhi NCR" },
        { id: "jurisdiction", label: "Jurisdiction", ph: "e.g. Delhi, India" },
      ],
    },
    {
      id: "termination", name: "Termination Letter", icon: "📭", desc: "Employment Termination",
      fields: [
        { id: "company", label: "Company", ph: "Company name" },
        { id: "employee", label: "Employee Name", ph: "Full name" },
        { id: "designation", label: "Designation", ph: "Role / Title" },
        { id: "reason", label: "Reason for Termination", ph: "e.g. Performance, restructuring", full: true },
        { id: "last_day", label: "Last Working Day", ph: "e.g. 31 May 2025" },
        { id: "notice", label: "Notice Period", ph: "e.g. 30 days or immediate" },
      ],
    },
    {
      id: "experience", name: "Experience Letter", icon: "🏅", desc: "Work Experience Certificate",
      fields: [
        { id: "company", label: "Company", ph: "Company name" },
        { id: "employee", label: "Employee Name", ph: "Full name" },
        { id: "designation", label: "Designation", ph: "Job title" },
        { id: "from_date", label: "From Date", ph: "e.g. 01 January 2022" },
        { id: "to_date", label: "To Date", ph: "e.g. 31 March 2025" },
        { id: "performance", label: "Performance Note", ph: "e.g. diligent, hardworking", full: true },
      ],
    },
    {
      id: "relieving", name: "Relieving Letter", icon: "🎉", desc: "No-Dues Relieving Letter",
      fields: [
        { id: "company", label: "Company", ph: "Company name" },
        { id: "employee", label: "Employee Name", ph: "Full name" },
        { id: "designation", label: "Designation", ph: "Role" },
        { id: "last_day", label: "Last Working Day", ph: "e.g. 30 June 2025" },
        { id: "notice", label: "Notice Period Served", ph: "e.g. 60 days / waived" },
      ],
    },
  ],
};

export const ALL_DOC_TYPES = Object.values(DOC_TYPES).flat();
