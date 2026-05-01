export const knowledgeBase = {
    greeting: {
        text: "Hello! I'm CivicGuide, your personal election assistant. How can I help you prepare for the upcoming elections today?",
        options: [
            { text: "How do I register?", action: "registration" },
            { text: "Election Timeline", action: "timeline" },
            { text: "Voting Process", action: "process" }
        ]
    },
    registration: {
        text: "Registering to vote is the first step! Here's how you do it:",
        steps: [
            "Check your eligibility (must be 18+ and a citizen).",
            "Gather your documents (ID, proof of address).",
            "Fill out the registration form online or in person.",
            "Submit and wait for your Voter ID card."
        ],
        options: [
            { text: "What documents do I need?", action: "documents" },
            { text: "Show me the timeline", action: "timeline" }
        ]
    },
    timeline: {
        text: "Here is the general timeline for the upcoming election cycle:",
        steps: [
            "Registration Deadline: 30 days before election day",
            "Early Voting Begins: 15 days before election day",
            "Absentee Ballot Request Deadline: 7 days before",
            "Election Day: Don't forget to vote!"
        ],
        options: [
            { text: "Tell me about the voting process", action: "process" }
        ]
    },
    process: {
        text: "Voting on election day is simple if you're prepared:",
        steps: [
            "Find your designated polling station.",
            "Bring your Voter ID or approved identification.",
            "Check in with the poll workers.",
            "Proceed to the voting booth and cast your ballot.",
            "Get your 'I Voted' sticker!"
        ],
        options: [
            { text: "What documents do I need?", action: "documents" },
            { text: "Go back to start", action: "greeting" }
        ]
    },
    documents: {
        text: "You will generally need one or more of the following documents to register or vote. Requirements may vary by state, so always check local guidelines.",
        steps: [
            "Government-issued Photo ID (Driver's License, Passport, State ID)",
            "Utility bill with your name and current address (less than 90 days old)",
            "Bank statement or Government check",
            "Birth certificate or Naturalization papers (for initial registration)"
        ],
        options: [
            { text: "How do I register?", action: "registration" },
            { text: "Check FAQs", action: "faq" }
        ]
    },
    faq: {
        text: "Here are some common questions about the election process:",
        steps: [
            "Q: Can I vote if I'm away from home? A: Yes, you can request an absentee or mail-in ballot.",
            "Q: What if I move? A: You must update your voter registration with your new address.",
            "Q: Where is my polling place? A: You can find it on your official election commission website.",
            "Q: Can I register on election day? A: Some states allow same-day registration, others require it weeks in advance."
        ],
        options: [
            { text: "Educational Resources", action: "resources" },
            { text: "Go back to start", action: "greeting" }
        ]
    },
    resources: {
        text: "Knowledge is power! Here are some official resources to help you stay informed:",
        steps: [
            "Vote.gov: Official US government site for voter registration info.",
            "EAC.gov: Election Assistance Commission for procedural standards.",
            "Local Election Office: Your primary source for local deadlines.",
            "Non-partisan Guides: Check sites like Ballotpedia or League of Women Voters."
        ],
        options: [
            { text: "How do I register?", action: "registration" },
            { text: "Go back to start", action: "greeting" }
        ]
    },
    unknown: {
        text: "I'm not quite sure about that specific question, but I'm learning every day! I can help you with registration, timelines, the voting process, or required documents.",
        options: [
            { text: "How do I register?", action: "registration" },
            { text: "Educational Resources", action: "resources" }
        ]
    }
};
