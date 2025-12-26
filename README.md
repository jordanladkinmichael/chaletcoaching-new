# Chaletcoaching - AI-Powered Fitness Course Generator

## 🚀 Overview

Chaletcoaching is an AI-powered fitness application that generates personalized workout plans using OpenAI's GPT-4 and DALL-E 3. Users can create custom fitness programs based on their preferences, goals, and equipment availability.

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Personalized Workout Plans** - Generated using OpenAI GPT-4
- **Custom Fitness Images** - Created with DALL-E 3
- **Nutrition Advice** - Tailored recommendations based on workout type
- **Safety Modifications** - Injury-safe alternatives and form guidance

### 🎯 Customization Options
- **Program Duration** - 1-12 weeks
- **Training Frequency** - 2-6 sessions per week
- **Workout Types** - HIIT, Strength, Cardio, Yoga, and more
- **Target Muscles** - Focus on specific muscle groups
- **Equipment Options** - Home, gym, or minimal equipment
- **Safety Features** - Injury-safe modifications

### 💰 Token-Based System
- **Preview Generation** - Test programs before full creation
- **Full Course Creation** - Complete programs with all features
- **PDF Export** - Downloadable workout plans
- **Image Generation** - Custom fitness photography

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **AI**: OpenAI GPT-4, DALL-E 3
- **Authentication**: NextAuth.js
- **Database**: SQLite (development), PostgreSQL (production)
- **Styling**: Custom theme system with CSS variables
- **Payments**: Flexible payment system (ready for integration)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- GitHub account
- Vercel account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitnessai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   # OpenAI API
   OPENAI_API_KEY=sk-your_actual_api_key_here
   
   # Database
   DATABASE_URL="file:./prisma/dev.db"
   
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### 1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `aifit` repository

### 3. **Configure Environment Variables**
   In Vercel project settings, add:
   ```bash
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   OPENAI_API_KEY=your_openai_api_key
   ```

### 4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Check deployment status in Vercel dashboard

## 🔑 OpenAI API Setup

### 1. Get API Key
- Visit [OpenAI Platform](https://platform.openai.com/)
- Create an account or sign in
- Navigate to "API Keys"
- Create a new API key
- Copy the key (starts with `sk-`)

### 2. Configure Environment
Add your API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-your_actual_api_key_here
```

### 3. Test Integration
- Restart the development server
- Try generating a preview or full course
- Check console for any errors

## 📱 Usage

### Creating a Fitness Program

1. **Navigate to Generator**
   - Click "Generator" in the header
   - Ensure you're signed in

2. **Configure Options**
   - Set program duration (1-12 weeks)
   - Choose training frequency (2-6 sessions/week)
   - Select workout types
   - Pick target muscle groups
   - Choose gender
   - Enable/disable features

3. **Generate Content**
   - Click "Generate Preview" for a sample
   - Click "Publish Full Course" for complete program
   - Monitor token balance

4. **Download & Use**
   - View generated content
   - Download PDF (if enabled)
   - Access from your dashboard

## 💡 API Endpoints

### Generator
- `POST /api/generator/preview` - Generate course preview
- `POST /api/generator/publish` - Create full course

### Tokens
- `GET /api/tokens/balance` - Check token balance
- `POST /api/tokens/spend` - Spend tokens
- `GET /api/tokens/history` - View transaction history

### Courses
- `GET /api/courses/list` - List user courses
- `POST /api/courses/generate-pdf` - Generate PDF

## 🎨 Customization

### Theme System
The app uses a custom theme system defined in `lib/theme.ts`:
- Color palette
- Typography
- Spacing
- Component styles

### Component Library
Reusable UI components in `components/`:
- `SiteHeader` - Navigation and authentication
- `SiteFooter` - Links and company information
- `Card`, `Button` - Basic UI elements
- `Toast` - Notification system

## 🔒 Security

- **Environment Variables** - Never commit `.env.local`
- **API Keys** - Secure storage and access control
- **Authentication** - NextAuth.js with secure sessions
- **Input Validation** - Server-side validation for all requests

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   npm run dev -- -p 3001
   ```

2. **OpenAI API Errors**
   - Check API key validity
   - Verify account balance
   - Check rate limits

3. **Database Issues**
   ```bash
   npx prisma db push --force-reset
   npx prisma generate
   ```

## 📚 Documentation

- [OpenAI Setup Guide](./OPENAI_SETUP.md)
- [PDF Generation Guide](./PDF_SETUP.md)
- [API Reference](./docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review troubleshooting guide

---

**Built with ❤️ using Next.js, OpenAI, and modern web technologies**
