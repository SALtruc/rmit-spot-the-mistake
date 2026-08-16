import { asset } from '../utils/assets'

export const documents = {
  cv: {
    id: 'cv', label: 'CV / Resume', overview: asset('CV/CV-overview.webp'), corrected: asset('CV/correct CV.png'), character: asset('CV/introduce screen/Character.png'), choice: asset('Choose type/Frame 198.png'),
    introAssets: { card: asset('CV/introduce screen/Frame 621.png'), help: asset('CV/introduce screen/Frame 42.png'), mistakes: asset('CV/introduce screen/Frame 619.png'), time: asset('CV/introduce screen/Frame 620.png'), review: asset('CV/introduce screen/Frame 614.png') },
    resultAssets: { board: asset('CV/result screen/Frame 200.png'), bubble: asset('CV/result screen/Bubble Chat.png'), yes: asset('CV/result screen/Frame 618.png'), no: asset('CV/result screen/Frame 105.png'), reflection: asset('CV/result screen/Frame 614.png'), character: asset('CV/result screen/Character.png') },
    instructionArt: asset('CV/Frame 470.png'),
    introTitle: 'New CV Received!', intro: 'A candidate has submitted their CV for review. Read every line like a recruiter would.', rule: 'Tap the line you think contains a mistake.',
    sections: [
      { title: 'Contact', lines: [
        ['dd/mm/yyyy — Date of birth listed on CV', true, 'Date of birth should not appear on a professional CV. Keep contact details to name, phone, email, city, and LinkedIn.'],
        ['0932 1xx 5xx · email@gmail.com', false, 'Phone and email are correctly formatted and appropriate.'],
        ['Binh Thanh district, Ho Chi Minh City', false, 'City-level location is fine. No full street address is needed.'],
      ] },
      { title: 'Skills', lines: [
        ['Communication · Teamwork · Time management', false, 'These soft skills are generic, but they are not the mistake in this section.'],
        ['Basic Microsoft Office', true, 'Do not self-label a skill as “basic”. Either list the tools specifically or leave the skill out.'],
        ['Slide design (Canva) · Photo and video editing (Lightroom, CapCut)', false, 'Specific tools are named appropriately.'],
      ] },
      { title: 'Education', clean: true, lines: [
        ['High School · Gia Dinh High School · 2018 – 2021', false, 'Correctly listed with full dates.'],
        ['Bachelor of Digital Marketing · RMIT University · 2022 – 2025', false, 'Degree, institution, and expected graduation year are present.'],
      ] },
      { title: 'Experience: Campus & Volunteer', lines: [
        ['RMIT Event Drive Volunteer · RMIT University · 3/2022 · On-event supporter', true, 'A single month with no end date is unclear. State a date range or clarify that this was a one-day event.'],
        ['Student Ambassador Team · RMIT University · 6/2022 – now · Campus tour guide · Event staff · Photographer', false, 'Role, organisation, dates, and responsibilities are clearly stated.'],
        ['Programme Volunteer · RMIT University · 11/2022 · Create content, film and edit short videos for Facebook', false, 'Tasks are specific and relevant.'],
        ['Global Talent Ambassador · AIESEC · 10/2022 – 12/2022 · Attract attendees through personal social media posts', false, 'Role and dates are correctly stated.'],
      ] },
      { title: 'Experience: Project & Professional', lines: [
        ['Media Team · I Connects Us Project – JCI Central Saigon · 3/2023 – now · Plan and create social content', false, 'Role, organisation, dates, and tasks are appropriate.'],
        ['Digital Marketing Intern · 4M Group · 8/2023 – now · Research new markets and develop content', false, 'Clear and relevant internship tasks.'],
        ['Be an account between the internal team and production team', true, '“Be an account” is grammatically incorrect. Use “Act as a liaison” or “Serve as the point of contact”.'],
        ['Writing content and monitoring the on-set period', false, 'The task is understandable, though consistent verb tense would improve it.'],
      ] },
    ],
  },
  linkedin: {
    id: 'linkedin', label: 'LinkedIn Profile', overview: asset('LinkedIn/LinkedIn-overview.webp'), corrected: asset('LinkedIn/correct LinkedIn.png'), character: asset('LinkedIn/introduce screen/Character.png'), choice: asset('Choose type/Frame 197.png'),
    introAssets: { card: asset('LinkedIn/introduce screen/Frame 617.png'), help: asset('LinkedIn/introduce screen/Frame 42.png'), mistakes: asset('LinkedIn/introduce screen/Frame 615.png'), time: asset('LinkedIn/introduce screen/Frame 616.png'), review: asset('LinkedIn/introduce screen/Frame 618.png') },
    resultAssets: { board: asset('LinkedIn/Result screen/Frame 200.png'), bubble: asset('LinkedIn/Result screen/Frame 618.png'), yes: asset('LinkedIn/Result screen/Frame 619.png'), no: asset('LinkedIn/Result screen/Frame 105.png'), reflection: asset('LinkedIn/Result screen/Frame 620.png'), character: asset('LinkedIn/Result screen/Character.png') },
    instructionArt: asset('LinkedIn/Frame 470.png'),
    introTitle: 'A LinkedIn Profile Needs Review!', intro: 'A student is applying for internships. Help them turn a casual profile into a credible first impression.', rule: 'Tap every line you think contains a mistake. You can choose more than one.',
    sections: [
      { title: 'Visuals, Name & Headline', lines: [
        ['Profile photo: a coffee-shop selfie in a hoodie, peace sign, cluttered background', true, 'This is unprofessional. Use a clear, professional headshot with an appropriate background.'],
        ['Background banner: default plain grey LinkedIn background', true, 'Leaving the banner at default looks unfinished. Use a professional graphic, campus shot, or clean design.'],
        ['Profile is set to public and visible to recruiters', false, 'This is the correct setting for a job seeker.'],
        ['Name: ✨ NA - Nguyen ~ Looking for Internships ✨', true, 'Do not put emojis or a headline in the name field; it looks cluttered and hurts searchability.'],
        ['Headline: Marketing Enthusiast · Passionate about changing the world · “Success is a journey”', true, 'Buzzwords and motivational quotes take space from skills, target roles, and evidence of value.'],
      ] },
      { title: 'About', lines: [
        ['Im a 2nd year student at RMIT studying Digital Marketing. I love social media, tiktok, and hanging out with my friends.', true, 'There are language errors and irrelevant personal details. The About section should focus on professional identity.'],
        ['I am a highly motivated individual with excellent leadership and communication skills who can work under pressure.', false, 'Generic, but not the primary mistake in this section. Evidence would make it stronger.'],
        ['I want to find a job in a big company like Unilever or VNG where I can grow my passion.', true, 'Name-dropping companies signals opportunism. Focus on the contribution you can make.'],
        ['Please hire me! 🥺 Check out my experience below.', true, 'This sounds desperate and unprofessional. End with a confident, professional call to action.'],
      ] },
      { title: 'Experience', lines: [
        ['Freelancer · Jan 2025 – Present', false, 'Role title and dates are present.'],
        ['Manage a page on Facebook for a small shop. Increased followers by a lot.', true, '“By a lot” is not evidence. Give a measurable outcome, such as a percentage and timeframe.'],
        ['Design posters using Canva.', false, 'Canva is a relevant tool for a marketing role.'],
        ['Do whatever my boss asked me to do.', true, 'This conveys passivity. Start bullets with a strong action verb and describe your contribution.'],
        ['RMIT Student Club · Oct 2024 – Dec 2024', false, 'Role and dates are clear.'],
        ['Joined the club and talked to people. Help to organize one event in HCMC campus.', false, 'This could be stronger, but it is not the primary mistake flagged here.'],
        ['Left because I was too busy with assignments.', true, 'Do not explain why you left a role on LinkedIn. List what you contributed instead.'],
      ] },
      { title: 'Education', lines: [
        ['RMIT University Vietnam · 2023 – 2026', false, 'Institution and dates are correctly stated.'],
        ['Bachelor of Digital Marketing', false, 'There is no mistake in this line.'],
        ['Grade: 2.1', true, 'If a GPA is not a strong selling point, it is better to leave it off.'],
      ] },
      { title: 'Skills', lines: [
        ['Microsoft Word — listed as the top skill', true, 'Microsoft Word is an expected baseline skill; it should not be the top-endorsed skill.'],
        ['Social Media', false, 'This is relevant for the target role.'],
        ['Canva', false, 'This is a specific, relevant tool.'],
      ] },
    ],
  },
  interview: {
    id: 'interview', label: 'Interview Transcript', overview: asset('Interview Transcript/Frame 618.png'), corrected: asset('Interview Transcript/correct interview transcript.png'), character: asset('Interview Transcript/introduce screen/Character.png'), choice: asset('Choose type/Frame 371.png'),
    introAssets: { card: asset('Interview Transcript/introduce screen/Frame 620.png'), help: asset('Interview Transcript/introduce screen/Frame 42.png'), mistakes: asset('Interview Transcript/introduce screen/Frame 618.png'), time: asset('Interview Transcript/introduce screen/Frame 619.png'), review: asset('Interview Transcript/introduce screen/Frame 614.png') },
    resultAssets: { board: asset('Interview Transcript/result screen/Frame 200.png'), bubble: asset('Interview Transcript/result screen/Bubble Chat.png'), yes: asset('Interview Transcript/result screen/Frame 618.png'), no: asset('Interview Transcript/result screen/Frame 105.png'), reflection: asset('Interview Transcript/result screen/Frame 614.png'), character: asset('Interview Transcript/result screen/Character.png') },
    instructionArt: asset('Interview Transcript/Frame 470.png'),
    sectionPreviews: [
      asset('Interview Transcript/interview transcript screen/Self-introduction.png'),
      asset('Interview Transcript/interview transcript screen/Why this role_.png'),
      asset('Interview Transcript/interview transcript screen/Relevant Experience.png'),
      asset('Interview Transcript/interview transcript screen/Strengths.png'),
      asset('Interview Transcript/interview transcript screen/Closing.png'),
    ],
    introTitle: 'Interview Transcript Received!', intro: 'Review a candidate’s answers before the recruiter does. Notice wording that affects trust and confidence.', rule: 'Tap the line you think contains a mistake.',
    sections: [
      { title: 'Self-introduction', question: 'Please introduce yourself', lines: [
        ['Hi, my name is Nguyen Minh Anh. I am currently studying Digital Marketing at RMIT University Vietnam, final year.', false, 'A clear, correct opener.'],
        ['I am looking for an internship because I need to complete my internship course.', true, 'Do not frame an internship as merely a course requirement. State the professional experience you want to gain.'],
        ['I am a hardworking and friendly person. I am also good at teamwork and communication.', false, 'Generic, but not the primary mistake here.'],
        ['In university, I joined group assignments and the Marketing Club, where I supported social media posts and student events.', false, 'Relevant experience is mentioned appropriately.'],
      ] },
      { title: 'Why this role?', question: 'Why do you want to apply for this role?', lines: [
        ['I want to apply for this role because I want to learn more about marketing and gain real work experience.', false, 'This shows genuine interest in learning.'],
        ['I do not have much professional experience yet, but I am willing to learn anything. I hope your company can train me and give me a chance.', true, 'This undermines the candidate and frames them as a charity case. Focus on what you can offer.'],
        ['I think this experience can be useful for my future career in marketing.', false, 'Vague, but not the primary mistake.'],
      ] },
      { title: 'Relevant experience', question: 'Can you tell me about any relevant experience you have?', lines: [
        ['I have worked part-time at a fashion store, so I know how to talk to customers.', false, 'Customer-facing work can be relevant marketing experience.'],
        ['I also used Canva before and sometimes helped manage Facebook messages for the store.', true, 'Weak qualifiers downplay real skills. Remove “before” and “sometimes helped”.'],
        ['I joined the Marketing Club at RMIT and helped support social media posts and student events.', false, 'Relevant extracurricular involvement is described.'],
      ] },
      { title: 'Strengths', question: 'What would you say are your strengths?', lines: [
        ['I think I am a hardworking and friendly person.', true, 'These are overused self-descriptors. Strengths need evidence and a specific example.'],
        ['I can work well under pressure and I am a fast learner.', false, 'Generic, but not the primary mistake.'],
      ] },
      { title: 'Closing', question: 'Is there anything else you would like to add before we close?', lines: [
        ['I hope your company can train me and give me a chance. That is all about me. Thank you.', true, 'This positions the candidate as a burden. End with a confident statement of contribution instead.'],
        ['Thank you so much for your time and for this opportunity.', false, 'Polite and professional closing courtesy.'],
      ] },
    ],
  },
}

export const getMistakeCount = (doc) => doc.sections.flatMap((section) => section.lines).filter(([, mistake]) => mistake).length
