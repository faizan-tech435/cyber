import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Upload, X, Shield, Paperclip } from 'lucide-react'
import { useIncidents } from '@/contexts/IncidentContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Incident } from '@/types'

const SEVERITY_INFO = [
  { value: 'low',      label: 'Low',      desc: 'Minor issue, no immediate risk',           color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
  { value: 'medium',   label: 'Medium',   desc: 'Moderate risk, should be addressed soon',  color: 'border-amber-500/40 bg-amber-500/5 text-amber-400' },
  { value: 'high',     label: 'High',     desc: 'Serious risk requiring prompt action',      color: 'border-orange-500/40 bg-orange-500/5 text-orange-400' },
  { value: 'critical', label: 'Critical', desc: 'Immediate threat to systems or data',       color: 'border-red-500/40 bg-red-500/5 text-red-400' },
]

export function ReportIncidentPage() {
  const { createIncident } = useIncidents()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', category: '', description: '', severity: '', affected_system: '',
    contact: '', occurred_at: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Incident | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (form.title.length > 120) e.title = 'Title must be under 120 characters.'
    if (!form.category) e.category = 'Please select a category.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (form.description.trim().length < 20) e.description = 'Please provide at least 20 characters of detail.'
    if (!form.severity) e.severity = 'Please select a severity level.'
    return e
  }

  const [uploadStatus, setUploadStatus] = useState<string>('')

  const uploadEvidenceFiles = async (incidentId: string, incidentFiles: File[]) => {
    if (incidentFiles.length === 0) return
    for (const file of incidentFiles) {
      try {
        const filePath = `${incidentId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data: uploaded, error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file, { contentType: file.type, upsert: false })
        if (uploadError) continue
        const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(filePath)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('incident_evidence').insert({
          incident_id: incidentId,
          file_name: file.name,
          file_url: urlData?.publicUrl || null,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id,
        })
      } catch {
        // Upload failure does not block incident submission
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    const { error, incident } = await createIncident({
      title: form.title,
      category: form.category,
      description: form.description,
      severity: form.severity,
      affected_system: form.affected_system || null,
    })
    if (error) { setErrors({ submit: error }); setSubmitting(false); return }
    if (incident && files.length > 0) {
      setUploadStatus('Uploading evidence files...')
      await uploadEvidenceFiles(incident.id, files)
      setUploadStatus('')
    }
    setSubmitting(false)
    if (incident) setSubmitted(incident)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter(f => f.size < 10 * 1024 * 1024)
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-10 text-center">
            <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 p-5 w-fit mx-auto mb-5">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Incident Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your incident has been submitted and assigned a unique reference ID. Our security team will review it shortly.
            </p>
            <div className="rounded-xl border border-border bg-background p-4 mb-6">
              <div className="text-xs text-muted-foreground mb-1">Reference ID</div>
              <div className="text-xl font-bold font-mono text-gradient">{submitted.reference_id}</div>
              <div className="text-xs text-muted-foreground mt-2">Save this ID to track your incident</div>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium text-foreground max-w-[200px] text-right truncate">{submitted.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-blue-400 font-medium">Submitted</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Severity</span>
                <span className="font-medium capitalize text-foreground">{submitted.severity}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cyber" onClick={() => navigate(`/incidents/${submitted.id}`)}>
                Track Incident
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(null); setForm({ title:'',category:'',description:'',severity:'',affected_system:'',contact:'',occurred_at:'' }); setFiles([]) }}>
                Submit Another
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>Back to Overview</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report an Incident</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a cybersecurity incident for review. All reports are treated confidentially.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Incident Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Incident Title <span className="text-red-400">*</span></Label>
              <Input id="title" value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })) }}
                placeholder="Brief description of the incident"
                className={errors.title ? 'border-red-500/50' : ''} />
              {errors.title && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category <span className="text-red-400">*</span></Label>
                <Select value={form.category} onValueChange={v => { setForm(f => ({ ...f, category: v })); setErrors(er => ({ ...er, category: '' })) }}>
                  <SelectTrigger className={errors.category ? 'border-red-500/50' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phishing_email">Phishing Email</SelectItem>
                    <SelectItem value="suspicious_link">Suspicious Website or Link</SelectItem>
                    <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                    <SelectItem value="malware">Malware Alert</SelectItem>
                    <SelectItem value="data_exposure">Data Exposure</SelectItem>
                    <SelectItem value="account_compromise">Account Compromise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occurred_at">Date & Time of Occurrence</Label>
                <Input id="occurred_at" type="datetime-local" value={form.occurred_at}
                  onChange={e => setForm(f => ({ ...f, occurred_at: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Detailed Description <span className="text-red-400">*</span></Label>
              <Textarea id="description" rows={5} value={form.description}
                onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: '' })) }}
                placeholder="Describe what happened, what you observed, any suspicious activity, links, emails, or other details..."
                className={errors.description ? 'border-red-500/50' : ''} />
              <div className="flex justify-between">
                {errors.description
                  ? <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.description}</p>
                  : <span />}
                <span className="text-xs text-muted-foreground">{form.description.length} chars</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="affected_system">Affected System or Department</Label>
              <Input id="affected_system" value={form.affected_system}
                onChange={e => setForm(f => ({ ...f, affected_system: e.target.value }))}
                placeholder="e.g. Email, Finance Department, HR Workstation WS-042" />
            </div>
          </CardContent>
        </Card>

        {/* Severity Selection */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Severity Level <span className="text-red-400">*</span></CardTitle>
            <p className="text-xs text-muted-foreground">Choose the severity that best describes the potential impact.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEVERITY_INFO.map(s => (
                <button type="button" key={s.value}
                  onClick={() => { setForm(f => ({ ...f, severity: s.value })); setErrors(er => ({ ...er, severity: '' })) }}
                  className={`rounded-xl border p-3 text-left transition-all ${form.severity === s.value ? s.color + ' ring-1 ring-offset-0' : 'border-border bg-secondary/30 hover:border-border/70'}`}>
                  <div className={`text-sm font-semibold mb-1 ${form.severity === s.value ? '' : 'text-foreground'}`}>{s.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
            {errors.severity && <p className="text-xs text-red-400 flex items-center gap-1 mt-2"><AlertCircle className="h-3 w-3" />{errors.severity}</p>}
          </CardContent>
        </Card>

        {/* Evidence Upload */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evidence Attachments</CardTitle>
            <p className="text-xs text-muted-foreground">Screenshots or documents. Max 5 files, 10MB each. JPG, PNG, PDF, TXT accepted.</p>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
              <span className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG, PDF, TXT — max 10MB each</span>
              <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf,.txt" onChange={handleFile} />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-blue-500/10 p-1"><Shield className="h-3.5 w-3.5 text-blue-400" /></div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{f.name}</div>
                        <div className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Reported by</Label>
                <Input value={user?.full_name || ''} disabled className="opacity-70" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="opacity-70" />
              </div>
            </div>
          </CardContent>
        </Card>

        {errors.submit && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />{errors.submit}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="cyber" disabled={submitting} className="flex-1 sm:flex-none sm:px-10">
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {uploadStatus || 'Submitting...'}
              </div>
            ) : 'Submit Incident Report'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
