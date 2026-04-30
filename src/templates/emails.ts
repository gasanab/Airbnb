export const welcomeEmail = (name: string, role: string): string => {
  const roleMessage = role === "HOST"
    ? "Start creating listings and begin earning today!"
    : "Explore thousands of unique listings and book your next adventure.";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5A5F; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .button { background-color: #FF5A5F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Airbnb!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for joining Airbnb! We're excited to have you on board.</p>
          <p>${roleMessage}</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <a href="http://localhost:3000" class="button">Get Started</a>
          <p>Happy exploring!</p>
          <p>The Airbnb Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const bookingConfirmationEmail = (
  guestName: string,
  listingTitle: string,
  location: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5A5F; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .booking-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF5A5F; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; color: #FF5A5F; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${guestName},</p>
          <p>Your booking has been confirmed. Here are your details:</p>
          <div class="booking-details">
            <div class="detail-row"><span class="detail-label">Listing:</span> ${listingTitle}</div>
            <div class="detail-row"><span class="detail-label">Location:</span> ${location}</div>
            <div class="detail-row"><span class="detail-label">Check-in:</span> ${checkIn}</div>
            <div class="detail-row"><span class="detail-label">Check-out:</span> ${checkOut}</div>
            <div class="detail-row"><span class="detail-label">Total Price:</span> $${totalPrice.toFixed(2)}</div>
          </div>
          <p><strong>Cancellation Policy:</strong> You can cancel your booking up to 7 days before check-in for a full refund.</p>
          <p>If you have any questions, please contact us.</p>
          <p>Safe travels!</p>
          <p>The Airbnb Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const bookingCancellationEmail = (
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5A5F; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .cancelled-notice { background-color: #fff3cd; padding: 15px; border-left: 4px solid #FF5A5F; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${guestName},</p>
          <div class="cancelled-notice">
            <p><strong>Your booking has been cancelled:</strong></p>
            <p><strong>${listingTitle}</strong><br>
            ${checkIn} - ${checkOut}</p>
          </div>
          <p>We hope you'll stay with us next time. Explore more listings and find your perfect getaway!</p>
          <p>If you need help, feel free to reach out.</p>
          <p>The Airbnb Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const passwordResetEmail = (name: string, resetLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5A5F; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .reset-button { background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 5px; margin: 20px 0; color: #721c24; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" class="reset-button">Reset Password</a>
          <div class="warning">
            <p><strong>Important:</strong> If you did not request this password reset, please ignore this email or contact our support team immediately.</p>
          </div>
          <p>The Airbnb Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
