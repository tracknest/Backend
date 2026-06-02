export const baseTemplate = (content: string, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TrackNest</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f4f6f9; font-family: 'Inter', Arial, sans-serif; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center; }
    .header .logo { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .header .logo span { color: #4f8ef7; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; }
    .text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f8ef7, #3a73d9); color: #ffffff !important; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 8px 0 24px; }
    .divider { border: none; border-top: 1px solid #e8edf3; margin: 28px 0; }
    .card { background: #f8fafc; border: 1px solid #e8edf3; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e8edf3; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-row .label { color: #718096; }
    .card-row .value { font-weight: 600; color: #1a1a2e; }
    .amount-positive { color: #22c55e; font-weight: 700; font-size: 18px; }
    .amount-negative { color: #ef4444; font-weight: 700; font-size: 18px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .otp-box { text-align: center; margin: 24px 0; }
    .otp-code { display: inline-block; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1a1a2e; background: #f1f5ff; border: 2px dashed #4f8ef7; border-radius: 12px; padding: 16px 28px; }
    .otp-note { font-size: 13px; color: #718096; margin-top: 12px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 18px; font-size: 13px; color: #92400e; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e8edf3; }
    .footer a { color: #4f8ef7; text-decoration: none; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ""}
  <div class="wrapper">
    <div class="header">
      <div class="logo">Track<span>Nest</span></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TrackNest. All rights reserved.</p>
      <p style="margin-top:6px;">
        You received this email because you have a TrackNest account.
        <br/>Questions? <a href="mailto:support@tracknest.com">support@tracknest.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;