import logger from "@/core/logger";
import { sendMailViaAdapter } from "./mail.adapter";
import {
  buildInvitationHtml,
  buildInvitationText,
  type InvitationTemplateData,
} from "./templates/invitation";
import {
  buildRoleChangeHtml,
  buildRoleChangeText,
  type RoleChangeTemplateData,
} from "./templates/role-change";
import {
  buildLinkDisabledHtml,
  buildLinkDisabledText,
  type LinkDisabledTemplateData,
} from "./templates/link-disabled";

export class MailService {
  async sendInvitationEmail(
    to: string,
    data: InvitationTemplateData,
  ): Promise<void> {
    await this.send(
      to,
      `You're invited to ${data.workspaceName}`,
      buildInvitationHtml(data),
      buildInvitationText(data),
    );
  }

  async sendRoleChangeEmail(
    to: string,
    data: RoleChangeTemplateData,
  ): Promise<void> {
    await this.send(
      to,
      `Role updated in ${data.workspaceName}`,
      buildRoleChangeHtml(data),
      buildRoleChangeText(data),
    );
  }

  async sendLinkDisabledEmail(
    to: string,
    data: LinkDisabledTemplateData,
  ): Promise<void> {
    await this.send(
      to,
      `Public sharing disabled for ${data.workspaceName}`,
      buildLinkDisabledHtml(data),
      buildLinkDisabledText(data),
    );
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    _text: string,
  ): Promise<void> {
    try {
      await sendMailViaAdapter({ to, subject, html });
      logger.info({ to, subject }, "Email sent");
    } catch (err) {
      logger.error({ err, to, subject }, "Failed to send email");
    }
  }
}

export const mailService = new MailService();
