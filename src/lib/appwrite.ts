import { Client } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("6854d601002800d85e1a");

export { client }; 