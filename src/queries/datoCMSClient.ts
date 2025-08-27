import { GraphQLClient } from 'graphql-request';

const DATO_CMS_ENDPOINT = 'https://graphql.datocms.com/';

let client: GraphQLClient | null = null;

const getClient = (): GraphQLClient => {
  if (!client) {
    const token = process.env.REACT_APP_DATO_CMS_API_TOKEN;

    if (!token) {
      throw new Error('DatoCMS API token is missing. Make sure it is set in your .env file and prefixed with REACT_APP_.');
    }

    client = new GraphQLClient(DATO_CMS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return client;
};

const datoCMSClient = new Proxy({} as GraphQLClient, {
  get: (target, prop, receiver) => Reflect.get(getClient(), prop, receiver),
});

export default datoCMSClient;
