export interface MailOptions {
  mailgunApiKey: string;
  mailgunDomainName: string;
}

export interface MailData {
  from: string;
  to: string;
  subject: string;
  template: string;
  'v:username': string;
  'v:code': string;
}

export interface MailResponse {
  id: string;
  message: string;
}
