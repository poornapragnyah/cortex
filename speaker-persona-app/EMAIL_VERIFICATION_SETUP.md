# Email Verification Setup Guide

## Overview
By default, Supabase requires email verification for new user registrations. This guide explains how to configure email verification for your Speaker Persona App.

## 1. Supabase Dashboard Configuration

### Step 1: Configure Auth Settings
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `nmfewmlalanmhgmpgryq`
3. Navigate to **Authentication** > **Settings**

### Step 2: Email Confirmation Settings
In the **Auth Settings**, configure:

```
Enable email confirmations: ON (enabled)
Confirm email change: ON (recommended)
Enable secure email change: ON (recommended)
```

### Step 3: Email Templates (Optional but Recommended)
1. Go to **Authentication** > **Email Templates**
2. Customize the **Confirm signup** template:

```html
<h2>Confirm your signup</h2>

<p>Hi {{ .Email }},</p>

<p>Welcome to the Speaker Portal! Please click the link below to verify your email address and complete your registration:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>

<p>If you didn't sign up for the Speaker Portal, you can safely ignore this email.</p>

<p>Thanks,<br>The Speaker Portal Team</p>
```

### Step 4: Site URL Configuration
1. In **Authentication** > **Settings**
2. Set your **Site URL** to: `http://localhost:5173` (for development)
3. For production, update to your actual domain

### Step 5: Redirect URLs
Add these redirect URLs in **Authentication** > **Settings** > **Redirect URLs**:
- `http://localhost:5173/dashboard` (development)
- `http://localhost:5173/verify-email` (development)

## 2. Alternative: Disable Email Confirmation (Not Recommended)

If you want to disable email confirmation for development only:

1. Go to **Authentication** > **Settings**
2. Turn OFF **Enable email confirmations**

⚠️ **Warning**: This is not recommended for production as it allows unverified email addresses.

## 3. Email Provider Configuration

### Default Email Provider
- Supabase provides a default email service for development
- Limited to 3 emails per hour in the free tier
- emails may go to spam folder

### Configure Custom Email Provider (Recommended for Production)
1. Go to **Authentication** > **Settings** > **SMTP Settings**
2. Configure with your email provider (SendGrid, Mailgun, etc.):

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
```

## 4. Testing Email Verification

### Development Testing
1. Register a new user account
2. Check your email inbox (and spam folder)
3. Click the verification link
4. You should be redirected to the dashboard

### Email Not Received?
- Check spam/junk folder
- Use the "Resend Verification Email" feature
- Verify SMTP configuration if using custom provider
- Check Supabase Auth logs for errors

## 5. Production Considerations

### Security
- Always enable email confirmation in production
- Use custom email templates for branding
- Configure proper SPF/DKIM records for your domain

### User Experience
- Provide clear instructions about email verification
- Implement resend functionality
- Show helpful error messages
- Consider email change confirmation flows

## 6. Troubleshooting

### Common Issues

**"Email not confirmed" error**:
- User hasn't clicked verification link
- Email went to spam
- Verification link expired (24 hours by default)

**Verification email not received**:
- Check spam folder
- Verify SMTP settings
- Check rate limits
- Ensure email address is valid

**Redirect not working**:
- Check Site URL configuration
- Verify redirect URLs are added
- Ensure URLs match exactly (including protocol)

### Email Rate Limits
Supabase free tier limitations:
- 3 emails per hour per project
- Consider upgrading for higher limits
- Use custom SMTP provider for unlimited emails

## 7. Code Implementation Complete

The following features have been implemented in your app:

✅ **Email verification flow**
- Automatic redirect to verification page after registration
- Pre-filled email address
- Resend verification email functionality

✅ **Enhanced login flow**
- Detects "email not confirmed" errors
- Redirects to verification page automatically
- Clear error messages

✅ **Email verification page**
- Professional UI matching your design
- Step-by-step instructions
- Resend functionality
- Success states

✅ **Updated authentication hook**
- Email verification status checking
- Resend email functionality
- Proper redirect URL configuration

## Next Steps

1. **Configure your Supabase dashboard** using the settings above
2. **Test the registration flow** with a real email address
3. **Check email delivery** (including spam folder)
4. **Customize email templates** for branding (optional)
5. **Set up custom SMTP** for production (recommended)

Your email verification system is now fully implemented and ready to use!
