

# Coaching Engineering — Implementation Plan

## 1. Design System & Theme
- Black backgrounds, white text/icons, grass green (#228B22) for accents, buttons, active states
- Custom Tailwind CSS variables for the 3-color palette
- Professional, minimalist typography

## 2. Authentication
- Email/password signup (Name, Surname, Email, Password) and login pages
- Supabase Auth via Lovable Cloud
- Profiles table (id, user_id, first_name, last_name) with auto-creation trigger
- Protected routes — redirect unauthenticated users to login

## 3. Database Schema (all tables with RLS — users see only their own data)
- **profiles** — first_name, last_name, linked to auth.users
- **match_analyses** — home_team, away_team, match_date, target_team, user_id
- **analysis_tabs** — match_analysis_id, tab_type (defense/attack/set_pieces), sub_tab (corner/free_kick/throw_in), formation, general_notes, pros, cons, images (array)
- **players** — name, current_team, birth_date, preferred_foot, primary_position, secondary_position, transfermarkt_link, user_id
- **squads** — name, formation, positions (JSON mapping position→player_id), user_id

## 4. Sidebar Navigation
- Persistent sidebar with icons+labels: Dashboard, Analysis Library, Player Library, Squad Builder, Settings, Account, Logout
- Collapsible with trigger button always visible
- Active route highlighting in green

## 5. Dashboard
- Landing page after login with two large action cards: "New Match Analysis" and "Add New Player"
- Quick stats (total analyses, total players)

## 6. Match Analysis Flow
- **Setup screen**: Form for home/away teams, date, target team selector → Continue button
- **Workspace**: Tabbed interface (Defense, Attack, Set Pieces)
  - Defense & Attack tabs: formation dropdown, 3 bullet-point sections (General Notes, Pros, Cons) with Enter-to-new-bullet behavior, image upload button
  - Set Pieces tab: sub-tabs (Corner, Free Kick, Throw-in) each with same structure
- Save analysis to database

## 7. Player Scouting
- Add/Edit player form with all specified fields
- Transfermarkt link rendered as clickable external link (opens new tab)
- Player profile view page

## 8. Libraries
- **Analysis Library**: searchable/filterable list of saved analyses with edit/delete
- **Player Library**: searchable/filterable list of saved players with edit/delete

## 9. Visual Squad Builder
- Large grass-green football pitch graphic (SVG/CSS)
- Formation dropdown (4-3-3, 3-5-2, 4-2-3-1, etc.) positions nodes on pitch
- Click a node → modal with player list (filtered by position) → assign player
- Save squad with custom name

## 10. Settings & Account
- Settings page (placeholder for future preferences)
- Account page showing profile info with edit capability

