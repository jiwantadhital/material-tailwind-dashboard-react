# Chatbot Setup Guide

## Overview
This chatbot implementation provides 24/7 customer support for your Sajilo Notary website using a combination of predefined responses and AI-powered responses via Hugging Face's free API.

## Features
- ✅ Floating chat widget (bottom-right corner)
- ✅ Quick reply buttons for common questions
- ✅ Text input for custom questions
- ✅ Knowledge base from your website data
- ✅ AI-powered responses using Hugging Face API
- ✅ Fallback responses when AI is unavailable
- ✅ Responsive design matching your website theme

## Setup Instructions

### 1. Get Hugging Face API Token (Free)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account
3. Go to your profile settings
4. Navigate to "Access Tokens"
5. Create a new token with "read" permissions
6. Copy the token (starts with `hf_`)

### 2. Configure Backend

Add the Hugging Face token to your Laravel `.env` file:

```env
HUGGING_FACE_TOKEN=hf_your_token_here
```

### 3. Test the Chatbot

1. Start your Laravel backend server
2. Start your React frontend
3. Navigate to any page on your website
4. Look for the chat icon in the bottom-right corner
5. Click to open the chatbot
6. Test with questions like:
   - "What services do you offer?"
   - "How much does notary service cost?"
   - "How do I get started?"

## How It Works

### Response Priority
1. **Predefined Responses**: Common questions about services, pricing, process, etc.
2. **AI Responses**: Uses Hugging Face T5-small model for general questions
3. **Fallback Responses**: When AI is unavailable

### Knowledge Base
The chatbot automatically pulls information from:
- Your services data (name, description, pricing)
- Homepage content (hero, features, testimonials)
- Predefined FAQ
- Contact information

### Quick Reply Options
- "What services do you offer?"
- "How much does notary service cost?"
- "What documents do I need?"
- "How long does the process take?"
- "How do I get started?"
- "Contact information"

## Customization

### Adding New Quick Replies
Edit the `quickReplies` array in `src/components/Chatbot.jsx`:

```javascript
const quickReplies = [
  "What services do you offer?",
  "How much does notary service cost?",
  // Add your custom questions here
];
```

### Adding New Predefined Responses
Edit the `getPredefinedResponse` method in `app/Http/Controllers/Api/ChatbotController.php`:

```php
// Add new conditions for specific keywords
if (strpos($message, 'your_keyword') !== false) {
    return "Your custom response here";
}
```

### Styling
The chatbot uses Tailwind CSS classes and matches your website's blue theme. You can customize colors, sizes, and positioning in the `Chatbot.jsx` component.

## API Endpoints

### Generate Response
```
POST /api/chatbot/generate-response
Body: { "message": "user question" }
```

### Get Knowledge Base
```
GET /api/chatbot/knowledge-base
```

## Troubleshooting

### Chatbot Not Appearing
1. Check browser console for errors
2. Ensure the Chatbot component is imported in App.jsx
3. Verify the component is rendered in the return statement

### API Errors
1. Check Laravel logs for backend errors
2. Verify Hugging Face token is set in .env
3. Ensure API routes are properly registered

### No AI Responses
1. Check Hugging Face token validity
2. Verify internet connection
3. Check if you've exceeded free tier limits (30,000 requests/month)

## Free Tier Limits

- **Hugging Face**: 30,000 requests per month
- **Model**: T5-small (60M parameters, fast and efficient)
- **Cost**: $0 (completely free)

## Security

- All API calls go through your Laravel backend
- Hugging Face token is stored securely in environment variables
- No sensitive data is sent to external APIs
- Fallback responses ensure service availability

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check Laravel logs for backend errors
3. Verify all setup steps are completed
4. Test with simple questions first

The chatbot is designed to be robust and will always provide helpful responses, even when the AI service is unavailable. 