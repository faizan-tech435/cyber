import { useState } from 'react'
import { BookOpen, CheckCircle2, XCircle, Award, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const MODULES = [
  {
    id: 'phishing',
    title: 'Phishing Awareness',
    description: 'Learn to identify phishing emails and social engineering attacks.',
    icon: '🎣',
    color: 'from-red-500/20 to-orange-500/10 border-red-500/20',
    duration: '5 min',
    questions: [
      {
        q: 'Which of the following is a common indicator of a phishing email?',
        options: [
          'The email comes from your IT department using the official domain',
          'Urgent language asking you to click a link or provide credentials immediately',
          'The email has proper grammar and no suspicious links',
          'The email is from a known contact with a verifiable email address',
        ],
        correct: 1,
        explanation: 'Phishing emails frequently use urgent, threatening language to pressure recipients into acting quickly without thinking critically.'
      },
      {
        q: 'You receive an email from "support@g00gle.com" asking you to verify your account. What do you do?',
        options: [
          'Click the link and verify your account as instructed',
          'Reply to the email asking for more information',
          'Do not click any links; report the email to IT security',
          'Forward it to your colleagues so they know',
        ],
        correct: 2,
        explanation: 'The domain "g00gle.com" uses zeros instead of the letter O — a common typosquatting technique. Never click such links; report to IT.'
      },
      {
        q: 'What is "spear phishing"?',
        options: [
          'A phishing attack targeting a broad range of random users',
          'A phishing attack targeting a specific individual or organization using personalized information',
          'A phishing attack using physical mail instead of email',
          'A phishing attack that uses phone calls',
        ],
        correct: 1,
        explanation: 'Spear phishing targets specific individuals using researched personal details to make the message appear more credible.'
      },
    ]
  },
  {
    id: 'passwords',
    title: 'Password Security',
    description: 'Create and manage strong passwords and understand credential hygiene.',
    icon: '🔐',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20',
    duration: '4 min',
    questions: [
      {
        q: 'Which of the following is the strongest password?',
        options: [
          'Password123',
          'John1990!',
          'C@t5&Purple#Moon42!',
          'qwerty',
        ],
        correct: 2,
        explanation: 'A strong password uses a mix of uppercase, lowercase, numbers, and special characters, and is at least 12 characters long without being a common word.'
      },
      {
        q: 'What is the safest way to manage multiple complex passwords?',
        options: [
          'Write them in a notebook kept at your desk',
          'Reuse the same password across all accounts',
          'Use a reputable password manager',
          'Save them in a text file on your desktop',
        ],
        correct: 2,
        explanation: 'A reputable password manager securely encrypts your passwords and allows you to use a unique, complex password for every account.'
      },
      {
        q: 'How often should you change your password for a critical work system?',
        options: [
          'Never — if it has not been compromised, do not change it',
          'Every year on your birthday',
          'Immediately if you suspect it has been compromised, or per your organization\'s policy',
          'Only when IT forces you to',
        ],
        correct: 2,
        explanation: 'Modern guidance recommends changing passwords immediately if compromise is suspected, or following your organization\'s specific security policy.'
      },
    ]
  },
  {
    id: 'mfa',
    title: 'Multi-Factor Authentication',
    description: 'Understand why MFA is critical and how to use it properly.',
    icon: '🛡️',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    duration: '3 min',
    questions: [
      {
        q: 'What is the primary purpose of Multi-Factor Authentication (MFA)?',
        options: [
          'To make logging in take longer and deter attackers',
          'To add an additional verification layer so a stolen password alone is insufficient',
          'To replace passwords entirely',
          'To monitor user behavior for suspicious patterns',
        ],
        correct: 1,
        explanation: 'MFA requires something you know (password) plus something you have (phone/token) or something you are (biometric), making accounts significantly harder to compromise.'
      },
      {
        q: 'You receive an unexpected MFA push notification on your phone while not currently logging in. What should you do?',
        options: [
          'Approve it — it might be a system update',
          'Ignore it',
          'Deny it and immediately change your password, then report to IT',
          'Wait to see if more notifications arrive',
        ],
        correct: 2,
        explanation: 'An unexpected MFA prompt indicates someone else has your credentials and is attempting to log in. Deny and report immediately.'
      },
      {
        q: 'Which MFA method is generally considered the most secure?',
        options: [
          'SMS text message codes',
          'Email verification codes',
          'Hardware security keys (FIDO2/WebAuthn)',
          'Security questions',
        ],
        correct: 2,
        explanation: 'Hardware security keys are phishing-resistant because they verify the site\'s domain. SMS codes can be intercepted; security questions are knowledge-based and often guessable.'
      },
    ]
  },
  {
    id: 'social',
    title: 'Social Engineering',
    description: 'Recognize manipulation tactics used to bypass security controls.',
    icon: '🎭',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/20',
    duration: '5 min',
    questions: [
      {
        q: 'A caller claims to be from IT support and asks for your password to fix a technical issue. What do you do?',
        options: [
          'Provide the password since they identified themselves as IT',
          'Provide the password if they know your name and department',
          'Refuse — legitimate IT staff will never ask for your password',
          'Ask them to send an email instead, then provide via email',
        ],
        correct: 2,
        explanation: 'Legitimate IT professionals never need your password. This is a classic "vishing" (voice phishing) attack using pretexting.'
      },
      {
        q: 'What is "tailgating" in the context of physical security?',
        options: [
          'Following someone too closely on the highway',
          'Sending emails that follow up excessively',
          'Gaining unauthorized physical access by following an authorized person through a secured door',
          'A type of SQL injection attack',
        ],
        correct: 2,
        explanation: 'Tailgating (also called piggybacking) is a physical social engineering attack where an attacker gains entry by following an authorized person into a secure area.'
      },
      {
        q: 'Which principle do social engineers most commonly exploit?',
        options: [
          'Technical system vulnerabilities',
          'Human psychology — urgency, authority, fear, and trust',
          'Software licensing weaknesses',
          'Network protocol flaws',
        ],
        correct: 1,
        explanation: 'Social engineering bypasses technical defenses by exploiting human psychology — creating urgency, impersonating authority figures, or building false trust.'
      },
    ]
  },
  {
    id: 'browsing',
    title: 'Safe Browsing',
    description: 'Stay safe online and recognize malicious websites.',
    icon: '🌐',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20',
    duration: '4 min',
    questions: [
      {
        q: 'A website shows a padlock icon in the browser bar. Does this mean it is safe?',
        options: [
          'Yes — the padlock means the website is legitimate and trustworthy',
          'No — the padlock only means the connection is encrypted; it does not verify the site is legitimate',
          'Yes — only verified websites can obtain SSL certificates',
          'No — the padlock is purely decorative',
        ],
        correct: 1,
        explanation: 'HTTPS/padlock only means communication is encrypted. Malicious sites can and do use HTTPS. Always verify the domain name carefully.'
      },
      {
        q: 'You are about to download software from a third-party website. What should you do first?',
        options: [
          'Proceed — it probably has a virus scanner built in',
          'Only download if the site looks professional',
          'Download from the official vendor website and verify file hashes when available',
          'Google the software name to find the fastest download link',
        ],
        correct: 2,
        explanation: 'Always download software from the official vendor source. Third-party sites frequently bundle malware. Verify checksums/hashes to confirm file integrity.'
      },
    ]
  },
  {
    id: 'data',
    title: 'Data Protection',
    description: 'Handle sensitive data responsibly and understand data classification.',
    icon: '📋',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20',
    duration: '4 min',
    questions: [
      {
        q: 'What is the correct action when you need to send sensitive personal data externally?',
        options: [
          'Send it in a standard email attachment',
          'Use an encrypted, approved transfer method and get authorization first',
          'Compress the file with a password in an email',
          'Share via a personal cloud storage link',
        ],
        correct: 1,
        explanation: 'Sensitive data must be transmitted using approved, encrypted channels. Many regulations (GDPR, HIPAA) require documented authorization for external personal data transfers.'
      },
      {
        q: 'You find a USB drive in the office parking lot. What should you do?',
        options: [
          'Plug it in to identify the owner',
          'Take it home to check its contents on a personal device',
          'Hand it to IT security without plugging it in',
          'Leave it where you found it',
        ],
        correct: 2,
        explanation: 'USB drops are a known attack vector. Attackers deliberately leave USB drives to get victims to plug them in. Always hand to IT security without connecting to any device.'
      },
    ]
  },
]

type QuizState = {
  moduleId: string
  currentQ: number
  answers: (number | null)[]
  submitted: boolean
  score: number
}

export function AwarenessPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Record<string, number>>({})
  const [quiz, setQuiz] = useState<QuizState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const startModule = (moduleId: string) => {
    setActiveModule(moduleId)
    setQuiz({ moduleId, currentQ: 0, answers: [], submitted: false, score: 0 })
    setSelected(null)
    setShowExplanation(false)
  }

  const module = MODULES.find(m => m.id === activeModule)
  const currentQuestion = module && quiz ? module.questions[quiz.currentQ] : null

  const handleAnswer = (idx: number) => {
    if (showExplanation) return
    setSelected(idx)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (!quiz || !module || selected === null) return
    const isCorrect = selected === currentQuestion?.correct
    const newAnswers = [...quiz.answers, selected]
    const newScore = quiz.score + (isCorrect ? 1 : 0)

    if (quiz.currentQ < module.questions.length - 1) {
      setQuiz({ ...quiz, currentQ: quiz.currentQ + 1, answers: newAnswers, score: newScore })
      setSelected(null)
      setShowExplanation(false)
    } else {
      setQuiz({ ...quiz, answers: newAnswers, submitted: true, score: newScore })
      setCompleted(prev => ({ ...prev, [module.id]: newScore }))
    }
  }

  if (activeModule && module && quiz) {
    if (quiz.submitted) {
      const pct = Math.round((quiz.score / module.questions.length) * 100)
      return (
        <div className="max-w-2xl mx-auto space-y-5">
          <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Modules
          </Button>
          <Card className="border-border">
            <CardContent className="p-10 text-center">
              <div className={`text-6xl mb-4`}>{pct >= 70 ? '🏆' : pct >= 50 ? '📚' : '💡'}</div>
              <h2 className="text-2xl font-bold mb-1">{module.title}</h2>
              <p className="text-muted-foreground mb-6">Quiz complete!</p>
              <div className={`text-5xl font-bold mb-2 ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {pct}%
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {quiz.score} of {module.questions.length} correct
              </p>
              {pct >= 70 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 mb-6">
                  <Award className="h-4 w-4" /> Module Completed
                </div>
              )}
              <div className="space-y-3 text-left mb-6">
                {module.questions.map((q, i) => {
                  const userAns = quiz.answers[i]
                  const correct = userAns === q.correct
                  return (
                    <div key={i} className={`rounded-xl border p-3 ${correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="flex items-start gap-2">
                        {correct ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                        <div>
                          <div className="text-xs font-medium text-foreground">{q.q}</div>
                          {!correct && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Correct: <span className="text-emerald-400">{q.options[q.correct]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="cyber" onClick={() => startModule(module.id)}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
                </Button>
                <Button variant="outline" onClick={() => setActiveModule(null)}>All Modules</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Exit Module
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {quiz.currentQ + 1} / {module.questions.length}
          </span>
        </div>
        <Progress value={((quiz.currentQ + (showExplanation ? 1 : 0)) / module.questions.length) * 100} className="h-1.5" />

        <Card className="border-border">
          <CardHeader>
            <div className="text-2xl mb-2">{module.icon}</div>
            <CardTitle className="text-base leading-relaxed">{currentQuestion?.q}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {currentQuestion?.options.map((opt, i) => {
                let cls = 'border-border hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer'
                if (showExplanation) {
                  if (i === currentQuestion.correct) cls = 'border-emerald-500/50 bg-emerald-500/10'
                  else if (i === selected && selected !== currentQuestion.correct) cls = 'border-red-500/50 bg-red-500/10'
                  else cls = 'border-border opacity-50'
                } else if (selected === i) {
                  cls = 'border-blue-500/50 bg-blue-500/10'
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all ${cls}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${showExplanation && i === currentQuestion.correct ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border text-muted-foreground'}`}>
                        {showExplanation && i === currentQuestion.correct
                          ? '✓'
                          : showExplanation && i === selected && selected !== currentQuestion.correct
                          ? '✗' : String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm text-foreground">{opt}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            {showExplanation && currentQuestion && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mb-4">
                <div className="text-xs font-semibold text-blue-400 mb-1">Explanation</div>
                <p className="text-sm text-foreground/90 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
            {showExplanation && (
              <Button variant="cyber" className="w-full" onClick={handleNext}>
                {quiz.currentQ < module.questions.length - 1 ? <>Next Question <ChevronRight className="h-4 w-4 ml-1" /></> : 'View Results'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Awareness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Learn to recognize and respond to cybersecurity threats. Complete modules to earn badges.
        </p>
      </div>

      {/* Progress summary */}
      {Object.keys(completed).length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <Award className="h-8 w-8 text-blue-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {Object.values(completed).filter(s => s / 3 >= 0.7).length} module{Object.values(completed).filter(s => s / 3 >= 0.7).length !== 1 ? 's' : ''} completed
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(completed).length} of {MODULES.length} attempted — keep going!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MODULES.map(mod => {
          const score = completed[mod.id]
          const pct = score !== undefined ? Math.round((score / mod.questions.length) * 100) : null
          const passed = pct !== null && pct >= 70
          return (
            <Card key={mod.id} className={`border bg-gradient-to-br ${mod.color} hover:scale-[1.01] transition-transform cursor-pointer`}
              onClick={() => startModule(mod.id)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{mod.icon}</div>
                  {passed && <Award className="h-5 w-5 text-emerald-400" />}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{mod.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {mod.questions.length} questions
                    </span>
                    <span>~{mod.duration}</span>
                  </div>
                  {pct !== null ? (
                    <span className={`text-xs font-semibold ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>{pct}%</span>
                  ) : (
                    <span className="text-xs text-blue-400 flex items-center gap-1">Start <ChevronRight className="h-3.5 w-3.5" /></span>
                  )}
                </div>
                {pct !== null && (
                  <Progress value={pct} className="mt-2 h-1" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
