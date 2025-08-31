// queries/getContactMe.ts
import datoCMSClient from './datoCMSClient';
import { ContactMe } from '../types';

const GET_CONTACT_ME = `
  query {
    contactme {
      profilePicture {
        url
      }
      name
      title
      summary {
        value
      }
      companyUniversity
      linkedinLink
      email
      phoneNumber
      githubLink
    }
  }
`;

export async function getContactMe(): Promise<ContactMe> {
  const data = await datoCMSClient.request<{ contactme: ContactMe }>(
    GET_CONTACT_ME,
  );
  return data.contactme;
}
