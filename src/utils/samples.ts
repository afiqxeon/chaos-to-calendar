export interface SamplePreset {
  id: string;
  label: string;
  description: string;
  content: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "engineering-sync",
    label: "Engineering Sync",
    description: "Structured sprint notes with relative deadlines",
    content: `Team Sync & Sprint Wrap-up Notes:
- Fix critical auth token expiration bug by tomorrow 2 PM before release.
- Send finalized client SOW proposal by Friday evening (due 5 PM).
- Hold technical sync call on Monday 10 AM with backend infra team.
- Submit expense receipts and review GitHub PR backlog by end of the week.
- Alice to update API documentation for the new webhook endpoints.`
  },
  {
    id: "messy-chat",
    label: "Messy Chat (WhatsApp/Slack)",
    description: "Informal conversational message without bullet points",
    content: `Hey team! Quick reminder: we need to jump on a quick UI review call tomorrow at 1 PM. Also don't forget to pay the cloud hosting invoice before Friday 5 PM. Sarah, please review the PR backlog when you have time, and let's aim to prep the release changelog sometime next week.`
  },
  {
    id: "brain-dump",
    label: "Brain Dump / Voice Memo",
    description: "Continuous stream-of-consciousness stream without dates",
    content: `I need to clean up my local docker containers and renew the domain SSL certificates sometime soon. Also make sure to draft the onboarding checklist for new interns, refactor the database seeders, and research better error boundary patterns for React. Need to buy more coffee beans too.`
  }
];

export const SAMPLE_NOTES = SAMPLE_PRESETS[0].content;
