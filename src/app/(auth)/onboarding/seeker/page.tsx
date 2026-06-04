'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/Button'

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'AWS', 'Docker', 'SQL', 'Java', 'Go',
  'Customer Service', 'Sales', 'Marketing', 'Management', 'Finance',
  'Hospitality', 'F&B', 'Retail', 'Healthcare', 'Education',
  'Arabic', 'English', 'Hindi', 'Urdu', 'Filipino',
]

const ROLE_OPTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Product Manager', 'Designer', 'Data Analyst',
  'Sales Manager', 'Marketing Manager', 'HR Manager',
  'Chef', 'Restaurant Manager', 'Hotel Manager',
  'Customer Service Rep', 'Retail Manager', 'Accountant',
]

export default function SeekerOnboardingPage() {
  const [step, setStep] = useState(0)
  const [skills, setSkills] = useState<string[]>([])
  const [desiredRoles, setDesiredRoles] = useState<string[]>([])
  const [experience, setExperience] = useState(0)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  function toggleRole(role: string) {
    setDesiredRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  async function handleComplete() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update profile location
    await supabase
      .from('profiles')
      .update({ location })
      .eq('id', user.id)

    // Create seeker profile
    await supabase.from('seeker_profiles').insert({
      profile_id: user.id,
      skills,
      desired_roles: desiredRoles,
      experience_years: experience,
    })

    router.push('/feed')
  }

  const steps = [
    // Step 0: Skills
    <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-xl font-semibold">What are your skills?</h2>
      <p className="text-sm text-white/50">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {SKILL_OPTIONS.map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              skills.includes(skill)
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Roles
    <motion.div key="roles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-xl font-semibold">What roles interest you?</h2>
      <div className="flex flex-wrap gap-2">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              desiredRoles.includes(role)
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2: Experience + Location
    <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Almost done!</h2>
        <label className="block text-sm text-white/60 mb-2">Years of experience</label>
        <input
          type="range"
          min={0}
          max={20}
          value={experience}
          onChange={(e) => setExperience(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Fresh grad</span>
          <span className="text-emerald-400 font-medium">{experience} years</span>
          <span>20+</span>
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="">Select city</option>
          <option value="Dubai, UAE">Dubai, UAE</option>
          <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
          <option value="Riyadh, KSA">Riyadh, KSA</option>
          <option value="Jeddah, KSA">Jeddah, KSA</option>
          <option value="Doha, Qatar">Doha, Qatar</option>
          <option value="Kuwait City, Kuwait">Kuwait City, Kuwait</option>
          <option value="Manama, Bahrain">Manama, Bahrain</option>
          <option value="Muscat, Oman">Muscat, Oman</option>
        </select>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {steps[step]}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1)
              else handleComplete()
            }}
            loading={loading}
          >
            {step < steps.length - 1 ? 'Next' : 'Start Discovering Jobs'}
          </Button>
        </div>
      </div>
    </div>
  )
}
