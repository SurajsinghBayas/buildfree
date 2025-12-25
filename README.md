# BuildFree

Find the best tools, credits, and resources to build projects — for free.

## Tech Stack
- React + Vite
- Tailwind CSS
- ShadCN/UI
- Framer Motion

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

## Adding Resources
Edit `public/resources.json` to add new tools. Format:
```json
{
  "toolName": "Name",
  "useCase": "Description",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "freeWhat": "What is free",
  "duration": "Duration",
  "eligibility": "Eligibility",
  "requiresCreditCard": "No",
  "link": "URL",
  "lastVerified": "Date",
  "indiaFriendly": true,
  "recommendedFor": ["tag"],
  "badge": "Badge Text"
}
```
