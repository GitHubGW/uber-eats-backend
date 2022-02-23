export interface MailOptions {
  mailgunApiKey: string;
  mailgunDomainName: string;
}

export interface MailData {
  [key: string]: string;
}

export interface MailResponse {
  id: string;
  message: string;
}
