import { LegacyLoader } from '@/components/LegacyLoader'
import { InterviewExperience } from '@/components/interview/interview-experience'

export default function Page() {
  return (
    <LegacyLoader>
      <InterviewExperience />
    </LegacyLoader>
  )
}