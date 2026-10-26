export const sendOtpSms = async ({ to }) => {
  const response = await fetch("https://api.ng.termii.com/api/sms/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      message_type: "NUMERIC",
      to,
      from: "N-Alert",
      channel: "generic",
      pin_attempts: 3,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text: `Your NYSC Connect verification code is < 1234 >. It expires in 10 minutes.`,
      pin_type: "NUMERIC",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to send SMS");
  }
  return data; // { pinId, ... }
};

export const verifyOtpSms = async ({ pinId, pin }) => {
  const response = await fetch("https://api.ng.termii.com/api/sms/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      pin_id: pinId,
      pin,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to verify SMS code");
  }
  return data.verified === true; // Termii returns verified: true/false
};