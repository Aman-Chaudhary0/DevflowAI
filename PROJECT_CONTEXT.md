# Devflow AI Project Context

## Project Summary

Devflow AI is a dark-first, premium, minimal developer workspace UI. It is designed as an AI-powered product interface for developers and teams that need project dashboards, AI chat, documentation, analytics, workflow management, and polished public pages.

This implementation is UI-only. There is no backend, authentication, database, or live AI integration yet.

## Required Pages

1. `/` Landing page with hero, dashboard mockup, trusted companies, features, AI showcase, product screens, workflow, testimonials, pricing preview, FAQ, and footer.
2. `/pricing` Pricing hero, billing toggle, pricing cards, comparison table, FAQ-style CTA.
3. `/features` Searchable feature hero, filters, feature cards, demos, performance stats.
4. `/about` Mission, story timeline, values, technology stack, team cards, stats.
5. `/blog` Blog landing with search, categories, featured article, sidebar, article grid, pagination action.
6. `/blog/ai-workspaces` Blog detail page with hero, author metadata, share action, sticky table of contents, article body, code block, related articles, comments.
7. `/docs` Documentation page with left nav, search, content, code snippets, right "On this page" sidebar, previous/next, feedback.
8. `/contact` Contact hero, contact info, form UI, map placeholder, FAQ cards.
9. `/privacy` Privacy policy layout with sticky navigation and legal content placeholders.
10. `/terms` Terms and conditions layout with sticky navigation and legal content placeholders.
11. `app/not-found.jsx` Custom 404 page with animated-style developer illustration panel, actions, recent page links, and developer quote.

## Design Direction

- Dark-first theme using `#0B0F19` background, `#111827` secondary background, `#1A2235` cards, `#273244` borders, `#F8FAFC` primary text, and `#3B82F6` primary accent.
- Light mode variables are present and can be toggled by the navbar theme button.
- Typography uses Space Grotesk for headings, Inter for body, and JetBrains Mono for code.
- UI style is professional, minimal, elegant, fast, clean, scalable, and developer friendly.
- Cards use `18px` radius, buttons use `14px`, inputs use `12px`.
- Responsive behavior is desktop-first with stacked layouts on tablet/mobile.

## Technology Choices

| Category | Technology | Why |
| --- | --- | --- |
| Framework | Next.js 15 App Router | Fast, SEO-friendly, production-ready routing |
| Language | JavaScript JSX | User requested JavaScript instead of TypeScript |
| Styling | Tailwind CSS v4 plus CSS tokens | Utility-ready setup with explicit theme variables |
| Icons | Lucide React | Clean, consistent SVG icon system |
| Animations | CSS micro-interactions, Framer Motion dependency available | Smooth hover and floating effects; Framer Motion can be layered in later |
| Charts | Recharts dependency available | Intended for future analytics implementation |
| Forms | React Hook Form and Zod dependencies available | Ready for future validated forms |
| Tables | TanStack Table dependency available | Ready for future advanced tables |
| Drag and Drop | dnd-kit dependencies available | Ready for future Kanban interactions |
| Code Editor | Monaco dependency available | Ready for future VS Code-style editor page |
| Markdown | react-markdown dependency available | Ready for future AI and docs rendering |
| Theme | CSS variables and client theme toggle | Dark-first with light mode support |

## Important Files

- `app/globals.css`: Global design tokens, theme variables, layout primitives, component classes, responsive rules.
- `app/layout.jsx`: Root layout with navbar, footer, metadata, and dark theme default.
- `components/navbar.jsx`: Shared public navbar with routes, theme toggle, and mobile menu button.
- `components/footer.jsx`: Shared footer with links, socials, newsletter, privacy, and terms.
- `components/ui-blocks.jsx`: Shared hero, feature grid, pricing cards, dashboard mock, search bar, code block, and rating components.
- `lib/data.js`: Shared nav, features, pricing, blog, stats, footer, and activity data.

## Future Work

- Replace placeholder terminal/image blocks with real product screenshots or generated bitmap visuals.
- Wire contact/newsletter forms to backend actions.
- Add Framer Motion page transitions and scroll reveal animations.
- Build authenticated dashboard pages for AI chat, code editor, Kanban, analytics, notifications, profile, and project details.
- Implement shadcn/ui components if the project adopts its CLI and component registry.
- Add real legal copy for Privacy and Terms before launch.
