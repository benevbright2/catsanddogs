import nodemailer from "nodemailer";
import assert from "assert";

const adminRecipient = process.env.ADMIN_RECIPIENT;

assert(adminRecipient, "ADMIN_RECIPIENT is not defined");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const getRegisterAdminEmailObject = (
  name: string,
  email: string,
  date: string
) => {
  return {
    to: adminRecipient,
    subject: "New registraion to your team!",
    html: `<p>Dear Admin</p>
                <p> You got a registraion to our team!</p>
                Name: ${name}<br>
                Email: ${email}<br>
                Registered at: ${date}
            `,
  };
};

const getUnsubscribeAdminEmailObject = (
  name: string,
  email: string,
  date: string
) => {
  return {
    to: adminRecipient,
    subject: "👋 Unsubscription on your team!",
    html: `<p>Dear Admin</p>
                <p>A member has unsubscribed.</p>
                Name: ${name}<br>
                Email: ${email}<br>
                Unsubscribed at: ${date}
            `,
  };
};

const getSignedUpEmailObject = (email: string, name: string) => {
  return {
    to: email,
    subject: "Thank you for your registration!",
    html: `
      <p>
        We'll send you an invitation, as soon as we book our field at Tempelhofer.
        We usually play one time per month during the summer.
        Looking forward to seeing you there!
      </p>
    `,
  };
};

const sendAdminEmail = async (
  name: string,
  email: string,
  date: string,
  type: "register" | "unsubscribe"
) => {
  let messageBody;
  switch (type) {
    case "register":
      messageBody = getRegisterAdminEmailObject(name, email, date);
      break;
    case "unsubscribe":
      messageBody = getUnsubscribeAdminEmailObject(name, email, date);
      break;
  }
  await sendEmail(messageBody);
};

const sendSignedUpEmail = async (email: string, name: string) => {
  const messageBody = getSignedUpEmailObject(email, name);
  await sendEmail(messageBody);
};

export { sendAdminEmail, sendSignedUpEmail };
