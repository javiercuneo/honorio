import { LegacyLoader } from '@/components/LegacyLoader'
import { PrefsProvider } from '@/components/prefs'
import { InterviewExperience } from '@/components/interview/interview-experience'

export default function Page() {
  return (
    <PrefsProvider>
      <LegacyLoader>
        <InterviewExperience />
      </LegacyLoader>
    </PrefsProvider>
  )
}
