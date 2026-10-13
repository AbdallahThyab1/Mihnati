# مِهنتي | Mihnati
### Discover Local Services. Connect with Professionals. Get Things Done.

<p align="center">
  <strong>A modern, AI-assisted local services discovery platform built to connect people with trusted professionals and businesses across Palestine.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Mobile%20Application-1B4332?style=for-the-badge" alt="Mobile Application" />
  <img src="https://img.shields.io/badge/Framework-React%20Native-40916C?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <em>From finding the right professional to getting the job done — Mihnati brings local services closer to everyone.</em>
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Vision & Mission](#-vision--mission)
- [Core Features](#-core-features)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [AI Integration](#-ai-integration)
- [Map & Location Experience](#-map--location-experience)
- [Business Model](#-business-model)
- [Development Roadmap](#-development-roadmap)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Security Considerations](#-security-considerations)
- [Design System](#-design-system)
- [Learning Outcomes](#-learning-outcomes)
- [Contributing](#-contributing)
- [Contact](#-contact)
- [License](#-license)

---

## 🌍 Overview

**Mihnati (مِهنتي)** is a mobile-first platform designed to simplify the way people discover, evaluate, and connect with local service providers, professionals, and businesses.

Finding a reliable electrician, plumber, repair technician, legal office, training center, or specialized local business should not require searching through dozens of social media posts, scattered recommendations, and unverified listings.

Mihnati aims to bring this experience into one accessible digital platform.

By combining structured service discovery, location-based exploration, provider profiles, and AI-assisted search, the platform helps users move from expressing a need to finding a relevant local solution.

### At a Glance

| Attribute | Description |
|---|---|
| Project | Mihnati — مِهنتي |
| Category | Local Services & Business Discovery |
| Primary Market | Palestine |
| Platform | Mobile Application |
| Frontend | React Native |
| Development Environment | Expo |
| Language | TypeScript |
| Backend Services | Supabase |
| AI Integration | Gemini through a Supabase Edge Function |
| Maps | Leaflet + OpenStreetMap |
| Product Focus | Discovery, trust, accessibility, and convenience |

> **Project status:** An actively developed mobile application and product prototype, with additional backend, booking, and business features planned for future iterations.

---

## 🎯 The Problem

Local service discovery is often fragmented across social media, messaging applications, personal recommendations, and disconnected business listings.

This creates several challenges for customers and service providers.

### For Customers

- **Fragmented discovery:** Relevant services are scattered across different platforms.
- **Difficulty finding the right provider:** Searching by service, specialty, and location can be time-consuming.
- **Limited information:** Comparing provider profiles, services, and customer feedback is not always straightforward.
- **Location uncertainty:** Discovering nearby professionals and businesses can require additional effort.
- **Repeated searches:** Customers may need the same service again but have no organized way to manage their service history or reminders.

### For Service Providers and Businesses

- **Limited digital visibility:** Skilled professionals and smaller businesses may struggle to reach new customers online.
- **Scattered communication:** Customer inquiries can arrive through multiple channels.
- **Difficult differentiation:** Providers need a clear way to present their services, specialties, and professional identity.
- **Growth opportunities:** Many local businesses could benefit from more structured digital discovery and customer engagement.

### The Opportunity

Mihnati aims to make local service discovery more organized, accessible, and intelligent — while helping local professionals and businesses strengthen their digital presence.

---

## 💡 Our Solution

Mihnati brings service discovery and local business exploration into a single mobile experience.

Instead of relying exclusively on manual searches, users can explore relevant categories, search for specific needs, discover providers on a map, and review provider information before making contact.

AI-assisted search adds another layer: users can describe what they need in natural language, helping translate everyday requests into more structured service searches.

### Product Principles

**Simplicity First**  
A user should be able to express a need and discover relevant options without navigating a complicated interface.

**Local by Design**  
Services and businesses should be discoverable in the context of the user's location and community.

**Trust Through Information**  
Provider profiles, service descriptions, ratings, and reviews can help users make more informed decisions.

**AI as an Assistant**  
AI should reduce search friction and improve discovery rather than complicate the user experience.

**Growth for Local Businesses**  
The platform aims to give professionals and businesses a more organized way to present their work and reach potential customers.

---

## 🚀 Vision & Mission

### Vision

To become a trusted digital destination for discovering local services, professionals, and businesses across Palestine, with the potential to expand into other markets.

### Mission

To bridge the gap between people who need services and the professionals who provide them through accessible mobile technology, intelligent discovery, and location-aware experiences.

### Long-Term Direction

Mihnati is designed around a broader local-services ecosystem that can evolve beyond a basic directory into a platform for discovery, communication, booking, and customer retention.

---

## ✨ Core Features

### 🔎 Intelligent Service Discovery

- Search for services, professionals, and businesses.
- Explore service categories.
- Discover relevant results through a structured search experience.
- Use AI-assisted search to interpret natural-language requests.
- Support the evolution toward more personalized discovery.

### 🤖 AI-Assisted Search

Users can describe their needs in everyday language instead of relying only on exact keywords.

For example:

> "بدي حد يصلح الغسالة في رام الله."

The AI processing layer can help identify the requested service, extract relevant keywords, and recognize the location when provided.

The application can then use this structured information to support service discovery.

### 🗺️ Interactive Map

- Explore service providers geographically.
- View provider markers on an interactive map.
- Filter results by category.
- Access provider information from map-related UI.
- Use location-aware discovery where supported.

The map experience uses Leaflet and OpenStreetMap through a WebView-based implementation.

### 👤 Provider Profiles

The platform is designed to present service providers through dedicated profiles containing relevant professional information.

Potential profile elements include:

- Provider or business name.
- Service categories and specialties.
- Description and service details.
- Images and portfolio content.
- Ratings and customer reviews.
- Contact options.

The exact information available depends on the implemented profile and backend functionality.

### ⭐ Ratings & Reviews

A planned trust layer that helps customers evaluate service providers using feedback and ratings.

### 📅 Booking Management

A planned booking experience designed around the following flow:

`Choose Provider → Select Service → Choose Date → Select Time → Confirm Booking`

Future iterations can introduce booking statuses, availability management, and booking history.

### 🔔 My Services & Service Reminders

A planned retention feature that helps users organize recurring service needs and return to relevant services when needed.

### 🏢 Join as a Service Provider

An onboarding experience for professionals and businesses who want to establish their presence on Mihnati.

The intended flow guides providers through their activity, services, location, and confirmation.

### 💎 Mihnati Pro

A planned premium offering for service providers and businesses.

Potential benefits include enhanced profiles, business analytics, service management, booking management, promotional offers, and increased visibility.

---

## 🔄 How It Works

The core product journey is designed to remain straightforward:

```text
┌──────────────────────┐
│     User Need        │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Search / AI Search   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Discover Relevant    │
│ Services & Providers │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Filter / Explore Map │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Review Provider      │
│ Information          │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Contact / Future     │
│ Booking Experience   │
└──────────────────────┘
```

The long-term experience can extend this journey with saved providers, service history, recurring reminders, and repeat bookings.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Mobile Application | React Native | Cross-platform mobile UI |
| Development Platform | Expo | Simplified development and testing |
| Programming Language | TypeScript | Type safety and maintainable application code |
| Navigation | Expo Router | File-based application navigation |
| Backend Services | Supabase | Backend infrastructure and future data services |
| AI Processing | Google Gemini | Natural-language request interpretation |
| Server-side AI Integration | Supabase Edge Functions | Secure AI request handling |
| Map Rendering | Leaflet | Interactive map interface |
| Map Data & Tiles | OpenStreetMap | Geographic map content |
| Map Integration | React Native WebView | Rendering the Leaflet experience in the mobile app |
| Location | Expo Location | Device location capabilities where permitted |
| UI Styling | React Native StyleSheet | Component and screen styling |

---

## 🏗️ System Architecture

Mihnati separates the mobile user experience from server-side AI processing and the mapping implementation.

### High-Level Architecture

```text
┌───────────────────────────────────────┐
│          Mihnati Mobile App           │
│          React Native + Expo          │
│                                       │
│  Home | Search | Results | Map        │
│  Profiles | Account | Provider Join   │
└───────────────────┬───────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
┌───────────────────┐  ┌───────────────────┐
│ AI Search Flow    │  │ Map Experience    │
│                   │  │                   │
│ Search Request    │  │ WebView           │
│       ↓           │  │       ↓           │
│ Supabase Edge     │  │ Leaflet           │
│ Function          │  │       ↓           │
│       ↓           │  │ OpenStreetMap     │
│ Gemini            │  │                   │
└───────────────────┘  └───────────────────┘
          │
          ▼
┌───────────────────────────────────────┐
│ Structured AI Response                │
│ Service | Category | Keywords          │
│ Location | Summary                    │
└───────────────────────────────────────┘
```

### Architectural Principles

- Keep AI provider credentials on the server side.
- Separate AI request processing from mobile UI components.
- Keep the mapping experience isolated from the rest of the application.
- Use reusable UI components to maintain visual consistency.
- Evolve toward structured backend data as the product matures.

This diagram describes the principal integration paths; it is not a claim that every planned module already has a production backend.

---

## 📂 Project Structure

The application follows a screen-oriented structure with reusable components, centralized mock data, and shared styling.

```text
Mihnati/
│
├── app/
│   └── pro.tsx
│
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── Avatar.tsx
│   │   ├── CategoryIcon.tsx
│   │   ├── Chip.tsx
│   │   ├── CraftsmanCard.tsx
│   │   ├── HScroll.tsx
│   │   ├── Logo.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── RatingPill.tsx
│   │   ├── ResultCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ScreenHeader.tsx
│   │   ├── TrustBanner.tsx
│   │   └── Txt.tsx
│   │
│   ├── data/
│   │   └── mock.ts
│   │
│   ├── screens/
│   │   ├── Account/
│   │   │   └── AccountScreen.tsx
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx
│   │   ├── Join/
│   │   │   └── JoinScreen.tsx
│   │   ├── Map/
│   │   │   └── MapScreen.tsx
│   │   ├── Profile/
│   │   │   └── ProfileScreen.tsx
│   │   ├── Pro/
│   │   │   └── MihnatiProScreen.tsx
│   │   ├── Results/
│   │   │   └── ResultsScreen.tsx
│   │   ├── Reviews/
│   │   │   └── ReviewsScreen.tsx
│   │   ├── Search/
│   │   │   └── AiSearchScreen.tsx
│   │   └── Splash/
│   │       └── SplashScreen.tsx
│   │
│   └── styles/
│       └── theme.ts
│
├── .env
├── package.json
└── README.md
```

> The tree reflects the known project structure. Add, remove, or rename entries to match the current repository before publishing documentation.

---

## 🧠 AI Integration

AI is intended to make service discovery more natural and less dependent on exact keyword matching.

### Request Flow

```text
User's Natural-Language Request
             │
             ▼
      Mobile Application
             │
             ▼
   Supabase Edge Function
             │
             ▼
       Gemini Model
             │
             ▼
       Structured JSON
             │
             ▼
  Search & Discovery Workflow
```

### Example

**Input**

```text
بدي حد يصلح الغسالة بكرة في رام الله.
```

**Illustrative structured response**

```json
{
  "service": "صيانة غسالات",
  "categoryId": "appliances",
  "keywords": [
    "تصليح غسالات",
    "صيانة غسالات",
    "غسالة"
  ],
  "location": "رام الله",
  "summary": "طلب صيانة غسالة في رام الله."
}
```

The response above is illustrative. Actual fields and extracted values depend on the implemented prompt, model response, and request.

### Why Structured AI Output?

Structured output makes it easier for the application to process a natural-language request and use the extracted information in subsequent discovery steps.

The AI layer can help identify:

- The requested service.
- Relevant search keywords.
- The service category.
- The location, when present.
- A concise summary of the request.

AI interpretation alone does not guarantee that a provider exists, is available, or can complete the requested service. Those results depend on the underlying service data and application logic.

---

## 🗺️ Map & Location Experience

Mihnati uses a WebView-based mapping approach to integrate Leaflet into the React Native application.

### Why Leaflet + OpenStreetMap?

This approach provides a flexible way to render an interactive map within the current Expo-based development environment.

Key elements include:

- Interactive map rendering.
- Provider markers.
- Category-based filtering.
- Map-related provider information.
- OpenStreetMap map content and attribution.

The implementation keeps the map experience within a dedicated screen, allowing the rest of the mobile application to remain independent of the map-rendering details.

Location access depends on device permissions and availability. Map data and third-party tile services are subject to their respective terms and usage policies.

---

## 💼 Business Model

Mihnati's business model is intended to prioritize accessible service discovery while creating opportunities for providers and businesses to pay for additional business value.

### Potential Revenue Streams

| Revenue Stream | Concept |
|---|---|
| Provider Subscriptions | Monthly or annual premium plans |
| Featured Listings | Paid visibility for participating providers |
| Business Advertising | Promotional placements for relevant local businesses |
| Booking Commissions | Potential fees for completed transactions |
| B2B Packages | Business-oriented tools and service packages |
| Premium Provider Tools | Advanced analytics and business management features |

### Free & Premium Strategy

**Free Experience**

A useful baseline experience for discovering services and exploring provider information.

**Mihnati Pro**

A potential paid tier for providers who need more visibility, enhanced profiles, analytics, offers, and operational tools.

These revenue streams are product hypotheses and future opportunities, not claims of existing revenue or active payment processing.

---

## 🗺️ Development Roadmap

The roadmap distinguishes the current application foundation from future product expansion.

### Application Foundation

- [x] React Native + Expo application
- [x] TypeScript-based screens and components
- [x] Reusable UI component structure
- [x] Core service discovery screens
- [x] AI-assisted search integration prototype
- [x] Supabase Edge Function integration
- [x] Leaflet + OpenStreetMap map experience
- [x] Provider onboarding interface
- [x] Mihnati Pro presentation screen

### Product & Backend Evolution

- [ ] Production-ready authentication and user accounts
- [ ] Structured provider and business database
- [ ] Persistent service and provider management
- [ ] Backend-powered search and filtering
- [ ] Production booking and availability management
- [ ] Persistent ratings and reviews
- [ ] Saved providers and service history
- [ ] My Services and recurring reminders
- [ ] Provider dashboard and analytics
- [ ] Subscription and payment integration
- [ ] Automated testing and production deployment

> Checklist items represent the development status understood when this README was drafted. Update them as implementation changes.

---

## 🚀 Getting Started

### Prerequisites

Before running Mihnati locally, make sure you have:

- Node.js installed.
- npm installed.
- Git installed.
- Expo-compatible development environment.
- Expo Go or an appropriate development build.
- Access to the required Supabase project and AI configuration if testing AI-powered functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/AbdallahThyab1/Mihnati.git
```

### 2. Navigate to the Project

```bash
cd Mihnati
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a local `.env` file using the variables required by the application's Supabase client.

Example:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the variable names expected by the current application code. If your project uses a different publishable-key variable name, keep the configuration consistent.

Never put a private service-role key or Gemini API key in a public mobile environment variable.

### 5. Start the Development Server

```bash
npx expo start
```

Follow the Expo CLI instructions to open the application in a supported simulator or on a device using Expo Go, where compatible.

---

## 🔐 Environment Configuration

Mihnati uses environment configuration to separate project settings from application code.

### Mobile Application

The mobile app should contain only the public configuration required to connect to Supabase.

### AI Backend

The Gemini API key should be stored as a server-side secret for the Supabase Edge Function.

Conceptually:

```text
Mobile Application
       │
       ▼
Supabase Edge Function
       │
       ├── Reads server-side Gemini secret
       │
       ▼
Gemini API
```

The mobile app should call the Edge Function rather than directly exposing a private Gemini credential.

### Important Repository Hygiene

- Do not commit private API keys.
- Do not commit Supabase service-role credentials.
- Keep local secret files out of version control.
- Provide a `.env.example` containing placeholders rather than real secrets.
- Review Git history if a secret has previously been committed.
- Rotate exposed credentials when necessary.

---

## 🎨 Design System

Mihnati follows a modern visual direction built around local identity, trust, clarity, and accessibility.

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary | Deep Green | `#1B4332` |
| Secondary | Fresh Green | `#40916C` |
| Background | Soft Off-White | `#F8F9F6` |
| Surface | White | `#FFFFFF` |
| Primary Text | Dark Gray | `#1F2933` |
| Secondary Text | Muted Gray | `#6B7280` |
| Border | Light Gray | `#E5E7EB` |
| Rating | Warm Gold | `#F4B942` |
| Error | Red | `#D64545` |
| Success | Green | `#2D936C` |

### UI Principles

- Clean layouts with clear visual hierarchy.
- Reusable components and consistent spacing.
- Rounded components without excessive decoration.
- Arabic-first presentation with attention to RTL layouts.
- Clear navigation and recognizable interaction patterns.
- Minimal friction when searching for a service.
- Consistent color usage across screens.

### Typography

The visual direction favors Cairo for Arabic-friendly typography, with readable hierarchy and consistent text styles.

---

## 📚 Learning Outcomes

Mihnati provides practical experience across multiple areas of software development.

### Mobile Engineering

- Structuring a React Native application.
- Building reusable TypeScript components.
- Organizing screens and navigation.
- Creating consistent UI patterns.
- Integrating device capabilities.

### Backend & AI Integration

- Connecting a mobile application to a backend service.
- Working with Supabase Edge Functions.
- Separating client-side logic from server-side secrets.
- Integrating natural-language processing into a product workflow.
- Handling structured AI responses.

### Maps & Location

- Embedding a Leaflet map through WebView.
- Displaying geographic information.
- Integrating provider markers and category filters.
- Considering location permissions and map-data dependencies.

### Product Development

- Translating a real-world problem into a product concept.
- Designing customer and provider journeys.
- Evaluating feature priorities.
- Exploring monetization strategies.
- Building and presenting an interactive product prototype.

---

## 🤝 Contributing

Mihnati is an evolving project. Suggestions, feedback, and thoughtful contributions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make focused, clearly scoped changes.
4. Test your changes.
5. Open a pull request describing the problem and proposed solution.

For significant changes, consider opening an issue first to discuss the intended behavior and implementation.

Please avoid including credentials, private user information, or other sensitive data in issues and pull requests.

---

## 📬 Contact

**Abdallah Thyab**  
Computer Engineering Student | Software Developer

- **GitHub:** [@AbdallahThyab1](https://github.com/AbdallahThyab1)
- **Project Repository:** [Mihnati](https://github.com/AbdallahThyab1/Mihnati)
- **Email:** 1abdallahthyab@gmail.com
- **LinkedIn:** [Abdallah Thyab](https://www.linkedin.com/)

For project-related questions, feedback, or collaboration opportunities, feel free to get in touch.

---

## 📄 License

No license has been specified for this repository in this README.

If you intend to distribute Mihnati as an open-source project, add a `LICENSE` file with the license you choose. Until then, do not assume that the repository grants permission to reuse, modify, or redistribute its contents.

---

<p align="center">
  <strong>مِهنتي — Mihnati</strong>
  <br />
  Discover Local Services. Connect with Professionals. Get Things Done.
  <br /><br />
  <em>Built with purpose, designed for people, and inspired by the potential of local communities.</em>
</p>
