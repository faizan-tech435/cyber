import { useState } from 'react'
import { Search, ChevronRight, ArrowLeft, BookOpen, Shield, FileText, AlertTriangle, HelpCircle, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ARTICLES = [
  {
    id: 'kb-001', category: 'Reporting Guidelines', icon: FileText,
    title: 'How to Report a Cybersecurity Incident',
    summary: 'Step-by-step guide for employees on submitting an incident report correctly.',
    content: `
## How to Report a Cybersecurity Incident

Prompt reporting is essential to minimize the impact of security incidents. Use the following steps:

### Step 1: Don't Panic — Document What You Observed
Note the time, what you saw, any error messages, and the systems involved. Screenshots are helpful.

### Step 2: Do Not Attempt to Fix It Yourself
Attempting to remediate on your own could destroy forensic evidence or spread malware.

### Step 3: Isolate If Possible
If your device is behaving abnormally, disconnect it from the network if you can safely do so.

### Step 4: Submit via CyberSafe Desk
Navigate to **Report Incident** in the sidebar and fill in:
- Incident title (brief, clear description)
- Category (Phishing, Malware, etc.)
- Detailed description of what happened
- Severity level
- Affected system or department
- Any evidence (screenshots, logs)

### Step 5: Save Your Reference ID
After submission, you'll receive a unique reference ID (e.g., INC-LK4X2Y-A1B2). Keep this for tracking.

### Step 6: Cooperate With the Security Team
You may be contacted by a security analyst for additional information. Respond promptly.

---
*Report all incidents, even if you're not sure. It's always better to report and be wrong than to stay silent.*
    `,
  },
  {
    id: 'kb-002', category: 'Best Practices', icon: Shield,
    title: 'Cybersecurity Best Practices for Employees',
    summary: 'Essential security habits every employee should follow to protect the organization.',
    content: `
## Cybersecurity Best Practices for Employees

### Password Hygiene
- Use a unique, complex password for every account (minimum 12 characters)
- Use a reputable password manager (e.g., Bitwarden, 1Password)
- Never share your passwords with anyone, including IT staff
- Enable Multi-Factor Authentication on all accounts that support it

### Email Safety
- Verify the sender's email domain carefully before clicking links
- Hover over links to preview the actual URL before clicking
- Never open unexpected attachments, especially .exe, .zip, .doc with macros
- When in doubt, verify via phone before acting on email instructions

### Device Security
- Lock your computer when you step away (Win+L / Cmd+Ctrl+Q)
- Keep your operating system and applications updated
- Never connect unknown USB devices
- Use only organization-approved software

### Safe Browsing
- Only access sensitive systems from trusted, secure networks
- Avoid using public Wi-Fi for work without a VPN
- Check for HTTPS and correct domain names on websites

### Physical Security
- Challenge tailgaters — never hold the door for unidentified visitors
- Secure physical documents containing sensitive information
- Use a privacy screen in public places
    `,
  },
  {
    id: 'kb-003', category: 'Incident Response', icon: AlertTriangle,
    title: 'Incident Response Procedures',
    summary: 'Formal incident response workflow for security analysts and administrators.',
    content: `
## Incident Response Procedures

CyberSafe Desk follows a structured incident response lifecycle:

### Phase 1: Preparation
- Ensure alerting and monitoring systems are active
- Maintain current contact lists for escalation
- Keep incident response playbooks up to date

### Phase 2: Identification
- Receive incident via CyberSafe Desk or automated alert
- Validate the incident (rule out false positives)
- Assign initial severity based on impact and scope
- Create or update the incident record

### Phase 3: Containment
- Short-term: Isolate affected systems to prevent spread
- Long-term: Implement patches, configuration changes, or policy updates
- Document all containment actions in investigation notes

### Phase 4: Eradication
- Remove the root cause (malware, compromised credentials, misconfiguration)
- Verify removal through scanning and monitoring
- Apply security patches

### Phase 5: Recovery
- Restore systems from clean backups where necessary
- Monitor systems closely after restoration
- Confirm normal business operations have resumed

### Phase 6: Lessons Learned
- Conduct a post-incident review within 2 weeks
- Update documentation and playbooks
- Identify gaps for security improvement
- Record resolution summary in CyberSafe Desk

---
*All phases must be documented in CyberSafe Desk using investigation notes.*
    `,
  },
  {
    id: 'kb-004', category: 'Security Policies', icon: Lock,
    title: 'Acceptable Use Policy',
    summary: 'Rules governing the acceptable use of organizational systems and data.',
    content: `
## Acceptable Use Policy

This policy governs the use of all organization systems, networks, and data.

### Authorized Use
- Systems are provided for legitimate business purposes
- Personal use is permitted within reasonable limits, provided it does not interfere with work or compromise security
- All use is subject to monitoring per applicable laws

### Prohibited Activities
- Installing unauthorized software
- Accessing, transmitting, or storing illegal content
- Attempting to bypass security controls
- Sharing credentials or access with unauthorized parties
- Using company systems for commercial activities outside your role
- Transmitting confidential data without authorization

### Data Classification
| Level | Description | Handling |
|-------|-------------|----------|
| Public | Available to all | No restrictions |
| Internal | For employees only | Restrict external sharing |
| Confidential | Sensitive business data | Encrypted, need-to-know |
| Restricted | Highly sensitive (PII, financial) | Strict controls, approval required |

### Violations
Policy violations may result in disciplinary action, up to and including termination, and may be referred to law enforcement where applicable.
    `,
  },
  {
    id: 'kb-005', category: 'FAQ', icon: HelpCircle,
    title: 'Frequently Asked Questions',
    summary: 'Answers to common questions about CyberSafe Desk and incident reporting.',
    content: `
## Frequently Asked Questions

**Q: What counts as a reportable incident?**  
A: Report anything that looks suspicious: unexpected emails asking for credentials, unusual system behavior, missing files, unauthorized access notices, or any activity you believe could be a security risk. When in doubt, report it.

**Q: Will I get in trouble for reporting something that turns out to be nothing?**  
A: Never. We encourage all reporting, even if it turns out to be a false alarm. It is far better to investigate and clear an issue than miss a real threat.

**Q: How long does it take to process a report?**  
A: Critical and High severity incidents are reviewed within 2 hours. Medium severity within 24 hours. Low severity within 72 hours.

**Q: Can I see the status of my report?**  
A: Yes. Log in to CyberSafe Desk, navigate to Incident Reports, and find your submission using your reference ID.

**Q: Who can see my incident report?**  
A: Security analysts and administrators assigned to your incident. Your report is handled confidentially.

**Q: What if the incident involves my manager?**  
A: You can escalate directly to the security team through CyberSafe Desk. All reports are handled with confidentiality and impartiality.

**Q: What is the difference between High and Critical severity?**  
A: Critical means active, ongoing compromise with significant impact (e.g., ransomware, confirmed data breach). High means serious risk requiring urgent response but not necessarily an active, ongoing breach.
    `,
  },
  {
    id: 'kb-006', category: 'Best Practices', icon: BookOpen,
    title: 'Remote Work Security Guidelines',
    summary: 'Security requirements and recommendations for employees working remotely.',
    content: `
## Remote Work Security Guidelines

Remote work introduces unique security risks. Follow these guidelines to protect organizational assets.

### Network Security
- Always use the organization's VPN when accessing internal systems
- Do not use public Wi-Fi without VPN — even cafes and hotels
- Ensure your home router uses WPA2 or WPA3 encryption
- Change default router credentials

### Device Security
- Use only organization-approved or approved-configuration personal devices
- Keep devices encrypted (BitLocker for Windows, FileVault for Mac)
- Use a screen lock with auto-lock after 5 minutes of inactivity
- Do not allow family members to use work devices

### Physical Security
- Use a privacy screen in shared spaces
- Do not discuss sensitive information in public
- Secure physical documents and shred when no longer needed
- Lock your physical workspace when away

### Video Conferencing
- Verify meeting links before joining
- Use waiting rooms for external meetings
- Do not share screen containing sensitive data unless necessary
- Be aware of your background — avoid sensitive information in view

### Incident Reporting
Remote workers should report incidents immediately via CyberSafe Desk, even if they cannot immediately contact IT by phone.
    `,
  },
]

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))]

export function KnowledgeBasePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState<typeof ARTICLES[0] | null>(null)

  const filtered = ARTICLES.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || a.category === activeCategory
    return matchSearch && matchCat
  })

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Knowledge Base
        </Button>
        <Card className="border-border">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
                <selected.icon className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 font-medium">{selected.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{selected.title}</h1>
            <p className="text-sm text-muted-foreground mb-8">{selected.summary}</p>
            <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/90 leading-relaxed space-y-4">
              {selected.content.trim().split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3">{line.replace('## ', '')}</h2>
                if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h3>
                if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" /><span>{line.replace('- ', '')}</span></div>
                if (line.startsWith('**')) return <p key={i} className="font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="text-muted-foreground italic">{line.replace(/\*/g, '')}</p>
                if (line.startsWith('---')) return <hr key={i} className="border-border my-4" />
                if (!line.trim()) return <div key={i} className="h-2" />
                return <p key={i}>{line}</p>
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Security policies, guidelines, incident response procedures, and FAQs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..." className="pl-9 h-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${activeCategory === cat ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'border border-border text-muted-foreground hover:border-border/70 hover:text-foreground'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No articles match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(article => (
            <Card key={article.id}
              onClick={() => setSelected(article)}
              className="border-border hover:border-blue-500/30 cursor-pointer transition-all hover:bg-accent/20 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-secondary p-2.5 shrink-0 group-hover:bg-blue-500/10 transition-colors">
                    <article.icon className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">{article.category}</div>
                    <h3 className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-blue-400 transition-colors">{article.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
