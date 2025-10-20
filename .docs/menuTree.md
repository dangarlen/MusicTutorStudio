# Menu Tree (Navigation & Controls)

Design goals:

- Mobile-first, modular layout
- Tailwind CSS + daisyUI components only
- Audit-safe, semantic structure for Music Tutor Studio
- Every page should include header and footer

## /public/alpha

### Proposed Design

#### index.html

- Create → `/alpha/creator.html`
- Practice → `/alpha/practice.html`
- Lessons → `/alpha/lessons.html`
- Preferences → `/alpha/preferences.html`
- About → `/alpha/about.html`

#### create.html

- Create Scales → `/alpha/create-scales.html` (extracted from show-scales.html)
- Create Exercises → `/alpha/create-exercises.html` (extracted from show-scales.html)
- Create Lesson → `/alpha/create-lessons.html` (extracted from show-scales.html)

#### practice.html

- Practice Scales → `/alpha/practice-scales.html` (extracted from show-scales.html)
- Practice Exercises → `/alpha/practice-exercises.html` (extracted from show-scales.html)

#### lessons.html

- Create Lesson → `/alpha/lessons-create.html` (extracted from orginal lessons.html)
- Launch Lesson →`/alpha/lessons-launch.html` (extracted from orginal lessons.html)
- Manage Lessons →`/alpha/lessons-manage.html` (extracted from orginal lessons.html)
- Manage Practice Units →`/alpha/lessons-manage-practice-units.html` (extracted from orginal lessons.html)

<br/><hr/><br/>

Add Headings to each of the following files where the heading is indicated before the Colon an the file name afterward
Music Tutor Studio (Version alpha - WIP): /alpha/index.html
Creator: /alpha/creator.html
Practice: /alpha/practice.html
Lessons: /alpha/lessons.html
Preferences: /alpha/preferences.html
About: /alpha/about.html
Scale Creator: /alpha/create-scales.html
Exercise Creator: /alpha/create-exercises.html
Lesson Creator: /alpha/create-lessons.html
Scale Practice: /alpha/practice-scales.html
Exercise Practice: /alpha/practice-exercises.html
Create Lessons: /alpha/lessons-create.html
Launch Lessons: /alpha/lessons-launch.html
Manage Lessons: /alpha/lessons-manage.html
Manage Practice Units (Scales & Imported Exercises): /alpha/lessons-manage-practice-units.html
each with this comment block at the top

<!-- Design goals:
     - Mobile-first, modular layout
     - Tailwind CSS + daisyUI components only
     - Audit-safe, semantic structure for Music Tutor Studio
     - Every page should include header and footer
-->

referancing Tailwind CSS and daisyUI
including public/alpha/fragments/header and public/alpha/fragments/footer

create new index.html entitled "Music Tutor Studio (Version alpha - WIP)"
with this comment block at the top

<!-- Design goals:
     - Mobile-first, modular layout
     - Tailwind CSS + daisyUI components only
     - Audit-safe, semantic structure for Music Tutor Studio
     - Every page should include header and footer
-->

referancing Tailwind CSS and daisyUI
including public/alpha/fragments/header and public/alpha/fragments/footer

add actual working daisyUI buttons as shown
"Create" → /alpha/creator.html
"Practice" → /alpha/practice.html
"Lessons" → /alpha/lessons.html
"Preferences" → /alpha/preferences.html
"About" → /alpha/about.html
