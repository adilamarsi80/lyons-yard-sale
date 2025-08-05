import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { email, fullName, registrationType, numberOfSpaces, totalAmount } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable not configured')
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Confirmed - Lyons Community Yard Sale</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Registration Confirmed!</h1>
            <p style="color: #e5f3ff; margin: 10px 0 0 0; font-size: 16px;">Lyons Community Yard Sale</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 18px; margin-bottom: 25px;">Hi \${fullName},</p>
            
            <p style="margin-bottom: 20px;">Thank you for registering as a vendor for the Lyons Community Yard Sale! Your payment has been processed successfully and your vendor spot is confirmed.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Registration Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Registration Type:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">\${registrationType.replace('-', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Number of Spaces:</td>
                  <td style="padding: 8px 0;">\${numberOfSpaces}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Paid:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #059669;">$\${totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #92400e; margin-top: 0;">📅 Event Information</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li><strong>Date:</strong> Saturday, September 13, 2025</li>
                <li><strong>Time:</strong> 9:00 AM - 3:00 PM</li>
                <li><strong>Location:</strong> Sandstone Park</li>
                <li><strong>Setup Time:</strong> Arrive as early as 7:00 AM</li>
                <li><strong>Tear Down:</strong> Must clear out by 4:30 PM</li>
              </ul>
            </div>
            
            <div style="background: #e0f2fe; border: 1px solid #0284c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0;">📋 Important Reminders</h3>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                <li>Check in at the registration table before setting up</li>
                <li>Bring your own tables, blankets, and supplies (no tents allowed)</li>
                <li>No glass, alcohol, or pets allowed</li>
                <li>Keep the park clean - no trash disposal in park facilities</li>
              </ul>
            </div>
            
            <p style="margin-top: 25px;">We're excited to have you as part of our first community yard sale! If you have any questions, please don't hesitate to reach out.</p>
            
            <p style="margin-bottom: 0;">See you on September 13th!</p>
            <p style="color: #6b7280; font-style: italic;">- The Lyons Community Yard Sale Team</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Town of Lyons | Community Events</p>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer \${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lyons Yard Sale <noreply@lyonsyardsale.com>',
        to: [email],
        subject: '✅ Registration Confirmed - Lyons Community Yard Sale',
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend API error: \${error}`)
    }

    const data = await res.json()
    
    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})