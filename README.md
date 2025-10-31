# JobInsight AI - Full-Stack Job Application Analysis System

A comprehensive Next.js application that provides AI-powered job application analysis using the GigaChat API. Features include job posting red flag detection, ATS-optimized cover letter generation, and resume optimization recommendations.

## Features

- **Job Posting Analysis**: AI-powered analysis of job postings to identify red flags, assess requirements, and provide insights
- **ATS-Optimized Cover Letters**: Generate personalized cover letters optimized for Applicant Tracking Systems
- **Resume Analysis**: Comprehensive resume evaluation with improvement suggestions and ATS compatibility scoring
- **Beautiful Glass Morphism UI**: Modern, responsive design using shadcn/ui components
- **Real-time Processing**: Live analysis with loading states and error handling
- **File Upload Support**: Upload resumes and job descriptions directly
- **Rate Limiting**: Built-in protection against API abuse

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **UI Components**: shadcn/ui with glass morphism styling
- **AI Integration**: GigaChat API for natural language processing
- **Styling**: Tailwind CSS with custom glass effects
- **Authentication**: GigaChat OAuth flow handling

## Prerequisites

- Node.js 18+ installed
- GigaChat API credentials (provided in the project)

## Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   The project includes a `.env.local` file with pre-configured GigaChat credentials:
   ```env
   GIGACHAT_CLIENT_ID=0199824b-4c1e-7ef1-b423-bb3156ddecee
   GIGACHAT_CLIENT_SECRET=46991ceb-e831-4b1a-b63a-25d18a37d5c7
   GIGACHAT_AUTHORIZATION_KEY=MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw==
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `GET/POST /api/auth/gigachat` - Handle GigaChat OAuth token management

### Analysis Services
- `POST /api/analyze/job-posting` - Analyze job postings for red flags and insights
- `POST /api/analyze/resume` - Analyze resume content and provide optimization suggestions
- `POST /api/generate/cover-letter` - Generate ATS-optimized cover letters

## Usage Guide

### Job Posting Analysis
1. Navigate to the "Job Analysis" tab
2. Paste a job posting URL or use "Job Content" tab for direct text input
3. Click "Analyze Job Posting" to get:
   - Red flag detection
   - Requirements assessment
   - Salary insights
   - Work-life balance indicators
   - ATS keywords
   - Company culture insights

### Resume Analysis
1. Go to the "Resume" tab
2. Upload a resume file or paste content directly
3. Get comprehensive analysis including:
   - ATS compatibility score
   - Strengths and weaknesses
   - Missing keywords
   - Formatting suggestions
   - Skills gap analysis

### Cover Letter Generation
1. Use the "Cover Letter" tab
2. Fill in your personal information
3. The system will use previously analyzed job postings or you can provide new content
4. Generate personalized, ATS-optimized cover letters

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/gigachat/      # Authentication handling
│   │   ├── analyze/            # Analysis endpoints
│   │   └── generate/           # Generation endpoints
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── analysis-results.tsx    # Job analysis display
│   ├── cover-letter-generator.tsx
│   ├── file-upload.tsx         # File handling component
│   ├── resume-analysis.tsx     # Resume results display
│   └── url-input.tsx          # URL input component
├── lib/
│   ├── gigachat.ts            # GigaChat API integration
│   ├── scraper.ts             # Web scraping utilities
│   ├── rate-limit.ts          # Rate limiting implementation
│   ├── types.ts               # TypeScript definitions
│   └── utils.ts               # Utility functions
└── README.md
```

## Security Features

- **Rate Limiting**: 5 requests per minute for analysis endpoints
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Sanitization**: Safe error messages without exposing internals
- **Secure Credential Storage**: Environment-based configuration

## API Integration Details

### GigaChat API
- **OAuth Endpoint**: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
- **Main API**: `https://gigachat.devices.sberbank.ru/api/v1`
- **Scope**: `GIGACHAT_API_PERS`
- **Token Management**: Automatic 30-minute token refresh

### Authentication Flow
1. Basic authentication with authorization key
2. Token acquisition and caching
3. Automatic refresh before expiration
4. Error handling for authentication failures

## Development

### Adding New Features
1. Create new API routes in `app/api/`
2. Add corresponding components in `components/`
3. Update types in `lib/types.ts`
4. Follow the existing glass morphism design patterns

### Testing
- Test API endpoints using the built-in authentication test
- Verify rate limiting functionality
- Test file upload and content parsing
- Validate error handling scenarios

## Deployment

### Production Setup
1. Update `NEXTAUTH_SECRET` with a secure random string
2. Configure `NEXTAUTH_URL` for your production domain
3. Ensure GigaChat API credentials are valid for production use
4. Set up monitoring for API usage and rate limits

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Error Handling

The application includes comprehensive error handling:
- Network request failures
- API authentication errors
- Rate limit exceeded responses
- Invalid input validation
- Graceful fallbacks for parsing errors

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript throughout the codebase
3. Implement proper error handling for all new features
4. Add appropriate rate limiting for new API endpoints
5. Maintain the glass morphism design aesthetic

## Support

For technical issues or questions about the GigaChat API integration, refer to the official GigaChat documentation or contact the development team.

## License

This project is created for educational and demonstration purposes. Please ensure compliance with GigaChat API terms of service when using in production.