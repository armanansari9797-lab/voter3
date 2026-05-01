# CivicGuide - Election Assistant

CivicGuide is a premium, AI-powered election assistant designed to help voters navigate the complexities of the registration and voting process. Built with a focus on accessibility, security, and performance.

## 🚀 Key Features

- **Interactive AI Chat**: Real-time assistance grounded in official election data using Google Gemini AI.
- **FAQ Knowledge Base**: Extensive built-in FAQ section for immediate answers to common voting questions.
- **Personalized Navigation**: Quick access to registration, timelines, processes, and documents.
- **Premium UI/UX**: Modern dark-mode interface with glassmorphism, micro-animations, and a "Clear Chat" feature for better session management.
- **Privacy First**: Anonymous authentication ensures user privacy while maintaining session state.
- **Full Accessibility**: ARIA-compliant components, enhanced screen reader labels, keyboard navigation, and semantic HTML.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JS (ES6+), CSS3 (Modern Variables & Glassmorphism), HTML5.
- **Build Tool**: Vite for fast development and optimized production builds.
- **AI Integration**: Google Generative AI (Gemini Flash) for intelligent grounded responses.
- **Architecture**: Modular service-oriented design with a dedicated UI Controller and state-aware rendering.
- **Backend Services**: 
    - **Firebase Auth**: Anonymous sign-in.
    - **Cloud Firestore**: Scalable knowledge base and interaction logging.
    - **Firebase Analytics**: Interaction tracking and user insights.


## 🛡️ Security & Performance

- **Zero-XSS Architecture**: Uses a DOM-first rendering strategy (no `innerHTML`).
- **Hardened CSP**: Strict Content Security Policy to mitigate injection attacks.
- **Optimized Loading**: Resource pre-fetching, font-display optimization, and asset lazy-loading.
- **Firestore Rules**: Granular security rules to protect user data and interaction logs.

## 🧪 Testing

The project includes a comprehensive test suite covering:
- UI Interactions (Jest & JSDOM)
- Service Logic (Mocked Firebase)
- AI Response Flows

## 📝 License

This project is intended for civic educational purposes.
