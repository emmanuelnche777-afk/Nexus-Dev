import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM || "onboarding@resend.dev";

export async function sendContractEmail(
  to: string,
  clientName: string,
  signUrl: string,
  contract: { id: string; contractType: string; serviceType: string; totalAmount: number | null; currency: string }
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Nexus Tech Hub: ${contract.contractType} for ${contract.serviceType}`,
      html: `
        <h1>Hello ${clientName},</h1>
        <p>A ${contract.contractType} has been prepared for your project: <strong>${contract.serviceType}</strong>.</p>
        <p>Total amount: ${contract.totalAmount ? `${contract.totalAmount.toLocaleString()} ${contract.currency}` : "TBD"}</p>
        <p>Please review and sign the contract using the link below:</p>
        <p><a href="${signUrl}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Sign Contract</a></p>
        <p>This link is valid for 7 days.</p>
        <p>Best regards,<br>Nexus Tech Hub Team</p>
      `,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to send contract email:", error);
    return false;
  }
}

export async function sendSignedConfirmationEmail(
  to: string,
  clientName: string,
  contractId: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from,
      to,
      subject: `Nexus Tech Hub: Your contract is signed`,
      html: `
        <h1>Hello ${clientName},</h1>
        <p>Your contract (#${contractId}) has been fully signed and locked.</p>
        <p>Thank you for working with Nexus Tech Hub.</p>
        <p>Best regards,<br>Nexus Tech Hub Team</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send signed confirmation:", error);
    return false;
  }
}
